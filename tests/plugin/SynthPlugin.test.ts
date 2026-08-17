import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TextmodeLayer, TextmodePluginContext } from 'textmode.js';

import type { LayerSynthState } from '../../src/core/types';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import { getLayerSynthState, setLayerSynthState } from '../../src/lifecycle/layerState';

function createLayer(): TextmodeLayer {
	return {} as TextmodeLayer;
}

function createHarness() {
	const layer = createLayer();
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

	it('consolidates layer cleanup in the returned cleanup', () => {
		const shader = { dispose: vi.fn() };
		const pendingShader = { dispose: vi.fn() };
		const buffer = { dispose: vi.fn() };
		const state = {
			shader,
			pendingShader,
			pingPongBuffers: [buffer, buffer],
			isDisposed: false,
		} as unknown as LayerSynthState;
		setLayerSynthState(harness.layer, state);

		const cleanup = SynthPlugin.install(harness.textmodifier as any, harness.api) as unknown as () => void;
		cleanup();

		expect(state.isDisposed).toBe(true);
		expect(shader.dispose).toHaveBeenCalledOnce();
		expect(pendingShader.dispose).toHaveBeenCalledOnce();
		expect(buffer.dispose).toHaveBeenCalledTimes(2);
		expect(getLayerSynthState(harness.layer)).toBeUndefined();
	});

	it('keeps layer extension state private to the synth package', () => {
		SynthPlugin.install(harness.textmodifier as any, harness.api);
		const bpm = harness.layerExtensions.get('layer:bpm')!.value! as (this: TextmodeLayer, value: number) => void;
		const clearSynth = harness.layerExtensions.get('layer:clearSynth')!.value! as (this: TextmodeLayer) => void;

		bpm.call(harness.layer, 128);
		expect(getLayerSynthState(harness.layer)?.bpm).toBe(128);

		clearSynth.call(harness.layer);
		expect(getLayerSynthState(harness.layer)).toBeUndefined();
	});

	it('keeps copy shaders isolated between simultaneous installations', async () => {
		const first = createHarness();
		const second = createHarness();
		const firstShader = { dispose: vi.fn() };
		const secondShader = { dispose: vi.fn() };
		first.textmodifier.createMaterialShader.mockResolvedValue(firstShader);
		second.textmodifier.createMaterialShader.mockResolvedValue(secondShader);

		const cleanupFirst = SynthPlugin.install(first.textmodifier as any, first.api) as unknown as () => void;
		const cleanupSecond = SynthPlugin.install(second.textmodifier as any, second.api) as unknown as () => void;
		await first.hooks.get('preSetup')!();
		await second.hooks.get('preSetup')!();
		cleanupFirst();

		expect(firstShader.dispose).toHaveBeenCalledOnce();
		expect(secondShader.dispose).not.toHaveBeenCalled();
		cleanupSecond();
		expect(secondShader.dispose).toHaveBeenCalledOnce();
	});

	it('leaves extension removal to the host runtime', () => {
		const cleanup = SynthPlugin.install(harness.textmodifier as any, harness.api) as unknown as () => void;
		cleanup();
		expect(typeof (harness.textmodifier as any).synth).toBe('function');

		for (const unregister of harness.unregisterExtensions) unregister();
		expect((harness.textmodifier as any).synth).toBeUndefined();
	});
});
