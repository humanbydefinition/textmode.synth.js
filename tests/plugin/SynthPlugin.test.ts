import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TextmodeLayer, TextmodePluginContext } from 'textmode.js';

import type { LayerSynthState } from '../../src/core/types';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import { PLUGIN_NAME } from '../../src/plugin/constants';

function createLayer(id: string): TextmodeLayer {
	let state: LayerSynthState | undefined;
	return {
		id,
		getPluginState: vi.fn(() => state),
		setPluginState: vi.fn((_name, value) => {
			state = value as LayerSynthState;
		}),
		deletePluginState: vi.fn(() => {
			state = undefined;
		}),
	} as unknown as TextmodeLayer;
}

function createHarness() {
	const layer = createLayer('base');
	const layerExtensions = new Map<string, PropertyDescriptor>();
	const hooks = new Map<string, (...args: any[]) => any>();
	const unregisterExtensions: Array<() => void> = [];
	const textmodifier = {
		createMaterialShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
		layers: { base: layer, all: [] },
	};
	const api = {
		defineExtension: vi.fn((target: string, name: string, descriptor: PropertyDescriptor) => {
			if (target === 'textmodifier')
				Object.defineProperty(textmodifier, name, { ...descriptor, configurable: true });
			else layerExtensions.set(`${target}:${name}`, descriptor);
			const unregister = () => {
				if (target === 'textmodifier') delete (textmodifier as any)[name];
				layerExtensions.delete(`${target}:${name}`);
			};
			unregisterExtensions.push(unregister);
			return unregister;
		}),
		on: vi.fn((name: string, callback: (...args: any[]) => any) => {
			hooks.set(name, callback);
			return () => hooks.delete(name);
		}),
	} as unknown as TextmodePluginContext;
	return { api, hooks, layer, layerExtensions, textmodifier, unregisterExtensions };
}

describe('SynthPlugin', () => {
	let harness: ReturnType<typeof createHarness>;

	beforeEach(() => {
		harness = createHarness();
	});

	it('registers the established extensions and lifecycle hooks', () => {
		SynthPlugin.install(harness.textmodifier as any, harness.api);

		for (const name of ['synth', 'clearSynth', 'bpm']) {
			expect(harness.layerExtensions.has(`layer:${name}`)).toBe(true);
		}
		expect(typeof (harness.textmodifier as any).synth).toBe('function');
		expect(typeof (harness.textmodifier as any).bpm).toBe('function');
		expect(typeof (harness.textmodifier as any).seed).toBe('function');
		expect([...harness.hooks.keys()]).toEqual(['preSetup', 'layerPreRender', 'layerDisposed']);
	});

	it('consolidates layer cleanup during uninstall', () => {
		const shader = { dispose: vi.fn() };
		const pendingShader = { dispose: vi.fn() };
		const buffer = { dispose: vi.fn() };
		const state = {
			shader,
			pendingShader,
			pingPongBuffers: [buffer, buffer],
			isDisposed: false,
		} as unknown as LayerSynthState;
		harness.layer.setPluginState(PLUGIN_NAME, state);

		SynthPlugin.install(harness.textmodifier as any, harness.api);
		SynthPlugin.uninstall?.(harness.textmodifier as any, harness.api);

		expect(state.isDisposed).toBe(true);
		expect(shader.dispose).toHaveBeenCalledOnce();
		expect(pendingShader.dispose).toHaveBeenCalledOnce();
		expect(buffer.dispose).toHaveBeenCalledTimes(2);
		expect(harness.layer.deletePluginState).toHaveBeenCalledWith(PLUGIN_NAME);
	});

	it('keeps copy shaders isolated between simultaneous installations', async () => {
		const first = createHarness();
		const second = createHarness();
		const firstShader = { dispose: vi.fn() };
		const secondShader = { dispose: vi.fn() };
		first.textmodifier.createMaterialShader.mockResolvedValue(firstShader);
		second.textmodifier.createMaterialShader.mockResolvedValue(secondShader);

		SynthPlugin.install(first.textmodifier as any, first.api);
		SynthPlugin.install(second.textmodifier as any, second.api);
		await first.hooks.get('preSetup')!();
		await second.hooks.get('preSetup')!();
		SynthPlugin.uninstall?.(first.textmodifier as any, first.api);

		expect(firstShader.dispose).toHaveBeenCalledOnce();
		expect(secondShader.dispose).not.toHaveBeenCalled();
		SynthPlugin.uninstall?.(second.textmodifier as any, second.api);
		expect(secondShader.dispose).toHaveBeenCalledOnce();
	});

	it('leaves extension removal to the host runtime', () => {
		SynthPlugin.install(harness.textmodifier as any, harness.api);
		SynthPlugin.uninstall?.(harness.textmodifier as any, harness.api);
		expect(typeof (harness.textmodifier as any).synth).toBe('function');

		for (const unregister of harness.unregisterExtensions) unregister();
		expect((harness.textmodifier as any).synth).toBeUndefined();
	});
});
