import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import type { TextmodePluginContext } from 'textmode.js';

describe('t.synth comfort method', () => {
	let api: TextmodePluginContext;
	let textmodifier: any;
	let baseLayer: any;
	let uninstallExtensions: () => void;

	beforeEach(() => {
		baseLayer = {
			synth: vi.fn(),
			getPluginState: vi.fn(),
			setPluginState: vi.fn(),
		};

		const unregisterFns: Array<() => void> = [];
		uninstallExtensions = () => {
			for (const unregister of unregisterFns) unregister();
		};

		textmodifier = {
			layers: {
				base: baseLayer,
			},
			createMaterialShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
		};

		api = {
			defineExtension: vi.fn((target: string, name: string, descriptor: PropertyDescriptor) => {
				if (target === 'textmodifier') {
					Object.defineProperty(textmodifier, name, { ...descriptor, configurable: true });
				}
				const unregister = () => {
					if (target === 'textmodifier') {
						delete (textmodifier as any)[name];
					}
				};
				unregisterFns.push(unregister);
				return unregister;
			}),
			registerLayerPreRenderHook: vi.fn(),
			registerLayerDisposedHook: vi.fn(),
			registerPreSetupHook: vi.fn(),
			layerManager: {
				base: baseLayer,
				all: [],
			},
		} as unknown as TextmodePluginContext;
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

	it('should remove synth method when the host uninstalls extensions', () => {
		SynthPlugin.install(textmodifier, api);
		expect(textmodifier.synth).toBeInstanceOf(Function);
		SynthPlugin.uninstall?.(textmodifier, api);
		uninstallExtensions();
		expect(textmodifier.synth).toBeUndefined();
	});
});
