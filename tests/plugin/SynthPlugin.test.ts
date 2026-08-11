import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import { PLUGIN_NAME } from '../../src/plugin/constants';
import { shaderManager } from '../../src/lifecycle/ShaderManager';
import type { TextmodeLayer, TextmodePluginContext } from 'textmode.js';
import type { LayerSynthState } from '../../src/core/types';

// Mocks
const createMockLayer = (id: string) => {
	let state: any = undefined;
	return {
		id,
		getPluginState: vi.fn(() => state),
		setPluginState: vi.fn((_name, s) => {
			state = s;
		}),
	} as unknown as TextmodeLayer;
};

describe('SynthPlugin', () => {
	let api: TextmodePluginContext;
	let layer: TextmodeLayer;
	let textmodifier: any;
	let layerExtensions: Map<string, PropertyDescriptor>;
	let uninstallExtensions: () => void;

	beforeEach(() => {
		shaderManager.dispose(); // Ensure clean state

		layer = createMockLayer('base');
		layerExtensions = new Map();
		const unregisterFns: Array<() => void> = [];
		uninstallExtensions = () => {
			for (const unregister of unregisterFns) unregister();
		};

		textmodifier = {
			createMaterialShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
			layers: {
				base: layer,
				all: [],
			},
		};

		api = {
			defineExtension: vi.fn((target: string, name: string, descriptor: PropertyDescriptor) => {
				if (target === 'textmodifier') {
					Object.defineProperty(textmodifier, name, { ...descriptor, configurable: true });
				} else {
					layerExtensions.set(`${target}:${name}`, descriptor);
				}
				const unregister = () => {
					if (target === 'textmodifier') {
						delete (textmodifier as any)[name];
					}
					layerExtensions.delete(`${target}:${name}`);
				};
				unregisterFns.push(unregister);
				return unregister;
			}),
			registerLayerPreRenderHook: vi.fn(),
			registerLayerDisposedHook: vi.fn(),
			registerPreSetupHook: vi.fn(),
		} as unknown as TextmodePluginContext;
	});

	it('should install and register hooks', () => {
		SynthPlugin.install(textmodifier, api);
		expect(api.registerLayerPreRenderHook).toHaveBeenCalled();
		expect(api.registerLayerDisposedHook).toHaveBeenCalled();
	});

	it('should register layer and textmodifier extensions', () => {
		SynthPlugin.install(textmodifier, api);
		for (const name of ['synth', 'clearSynth', 'bpm']) {
			expect(layerExtensions.has(`layer:${name}`)).toBe(true);
		}
		expect(typeof textmodifier.synth).toBe('function');
		expect(typeof textmodifier.bpm).toBe('function');
		expect(typeof textmodifier.seed).toBe('function');
	});

	it('should dispose resources on uninstall', () => {
		// Setup state with resources
		const shaderDispose = vi.fn();
		const bufferDispose = vi.fn();
		const state: Partial<LayerSynthState> = {
			shader: { dispose: shaderDispose } as any,
			pingPongBuffers: [{ dispose: bufferDispose }, { dispose: bufferDispose }] as any,
		};
		layer.setPluginState(PLUGIN_NAME, state as any);

		// Act
		SynthPlugin.uninstall?.(textmodifier, api);

		// Assert resources disposed
		expect(shaderDispose).toHaveBeenCalled();
		expect(bufferDispose).toHaveBeenCalledTimes(2);
	});

	it('should remove plugin state from layer on uninstall', () => {
		// Setup state
		const state: Partial<LayerSynthState> = { isDisposed: false };
		layer.setPluginState(PLUGIN_NAME, state as any);

		// Act
		SynthPlugin.uninstall?.(textmodifier, api);

		// Assert state removed
		expect(layer.getPluginState(PLUGIN_NAME)).toBeUndefined();
	});

	it('should mark state as disposed on uninstall', () => {
		// Setup state
		const state: Partial<LayerSynthState> = { isDisposed: false };
		layer.setPluginState(PLUGIN_NAME, state as any);

		// Act
		SynthPlugin.uninstall?.(textmodifier, api);

		// Assert state marked disposed
		expect(state.isDisposed).toBe(true);
	});

	it('should dispose global copy shader on uninstall', async () => {
		// Mock shader
		const mockShader = { dispose: vi.fn() };
		textmodifier.createMaterialShader = vi.fn().mockResolvedValue(mockShader);

		// Mock hook to execute immediately
		const hook = vi.fn((cb) => cb());
		api.registerPreSetupHook = hook as any;

		// Install and initialize
		SynthPlugin.install(textmodifier, api);
		await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async init

		expect(shaderManager.getShader()).toBe(mockShader);

		// Uninstall
		SynthPlugin.uninstall?.(textmodifier, api);

		// Assert shader disposed
		expect(mockShader.dispose).toHaveBeenCalled();
		expect(shaderManager.getShader()).toBeNull();
	});

	it('should leave extension cleanup to the host plugin runtime', () => {
		SynthPlugin.install(textmodifier, api);
		SynthPlugin.uninstall?.(textmodifier, api);

		// Extensions remain installed until the host removes them.
		expect(typeof textmodifier.synth).toBe('function');

		// Simulating the host's _removePluginExtensions.
		uninstallExtensions();
		expect(textmodifier.synth).toBeUndefined();
	});
});
