import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import type { TextmodePluginAPI } from 'textmode.js/plugins';

describe('t.synth comfort method', () => {
	let api: TextmodePluginAPI;
	let textmodifier: any;
	let baseLayer: any;

	beforeEach(() => {
		baseLayer = {
			synth: vi.fn(),
			getPluginState: vi.fn(),
			setPluginState: vi.fn(),
		};

		api = {
			extendLayer: vi.fn(),
			removeLayerExtension: vi.fn(),
			registerLayerPreRenderHook: vi.fn(),
			registerLayerDisposedHook: vi.fn(),
			registerPreSetupHook: vi.fn(),
			layerManager: {
				base: baseLayer,
				all: [],
			},
		} as unknown as TextmodePluginAPI;

		textmodifier = {
			bpm: undefined,
			layers: {
				base: baseLayer,
			},
			createFilterShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
		};
	});

	it('should add synth method to textmodifier on install', () => {
		expect(textmodifier.synth).toBeUndefined();
		SynthPlugin.install(textmodifier, api);
		expect(textmodifier.synth).toBeInstanceOf(Function);
	});

	it('should delegate synth call to layers.base.synth', () => {
		SynthPlugin.install(textmodifier, api);
		const source = { isSynthSource: true };
		textmodifier.synth(source);
		expect(baseLayer.synth).toHaveBeenCalledWith(source);
	});

	it('should delegate factory function to layers.base.synth', () => {
		SynthPlugin.install(textmodifier, api);
		const factory = vi.fn();
		textmodifier.synth(factory);
		expect(baseLayer.synth).toHaveBeenCalledWith(factory);
	});

	it('should remove synth method on uninstall', () => {
		SynthPlugin.install(textmodifier, api);
		expect(textmodifier.synth).toBeInstanceOf(Function);
		SynthPlugin.uninstall?.(textmodifier, api);
		expect(textmodifier.synth).toBeUndefined();
	});
});
