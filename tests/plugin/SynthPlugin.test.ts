import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SynthPlugin } from '../../src/plugin/SynthPlugin';
import { PLUGIN_NAME } from '../../src/plugin/constants';
import { shaderManager } from '../../src/lifecycle/ShaderManager';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { LayerSynthState } from '../../src/core/types';

// Mocks
const createMockLayer = (id: string) => {
    let state: any = undefined;
    return {
        id,
        getPluginState: vi.fn(() => state),
        setPluginState: vi.fn((name, s) => { state = s; }),
    } as unknown as TextmodeLayer;
};

describe('SynthPlugin', () => {
    let api: TextmodePluginAPI;
    let layer: TextmodeLayer;
    let textmodifier: any;

    beforeEach(() => {
        shaderManager.dispose(); // Ensure clean state

        layer = createMockLayer('base');
        api = {
            extendLayer: vi.fn(),
            removeLayerExtension: vi.fn(),
            registerLayerPreRenderHook: vi.fn(),
            registerLayerDisposedHook: vi.fn(),
            registerPreSetupHook: vi.fn(),
            layerManager: {
                base: layer,
                all: [],
            },
        } as unknown as TextmodePluginAPI;

        textmodifier = {
            bpm: undefined,
            createFilterShader: vi.fn().mockResolvedValue({ dispose: vi.fn() }),
        };
    });

    afterEach(() => {
        shaderManager.dispose();
    });

    it('should install and register hooks', () => {
        SynthPlugin.install(textmodifier, api);
        expect(api.registerLayerPreRenderHook).toHaveBeenCalled();
        expect(api.registerLayerDisposedHook).toHaveBeenCalled();
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
        textmodifier.createFilterShader = vi.fn().mockResolvedValue(mockShader);

        // Mock hook to capture the callback and manually trigger it
        const hook = vi.fn();
        api.registerPreSetupHook = hook as any;
        SynthPlugin.install(textmodifier, api);
        const [initCallback] = hook.mock.calls[0];
        await initCallback();

        expect(shaderManager.getShader()).toBe(mockShader);

        // Uninstall
        SynthPlugin.uninstall?.(textmodifier, api);

        // Assert shader disposed
        expect(mockShader.dispose).toHaveBeenCalled();
        expect(shaderManager.getShader()).toBeNull();
    });
});
