/**
 * TextmodeLayer extensions.
 *
 * Provides synth-related methods on TextmodeLayer instances:
 * - `synth()` - Apply a synth source to the layer
 * - `clearSynth()` - Remove synth from the layer
 * - `bpm()` - Set layer-specific BPM override
 *
 * @internal
 */

import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from '../core/SynthSource';
import { SynthSource as SynthSourceClass } from '../core/SynthSource';
import { PLUGIN_NAME } from '../plugin/constants';
import type { LayerSynthState } from '../core/LayerSynthState';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { CharacterResolver } from '../utils/CharacterResolver';

/**
 * Create a new LayerSynthState with default values.
 *
 * This factory function eliminates duplication between extensions
 * that need to initialize layer state.
 *
 * @param partial - Partial state to override defaults
 * @returns A complete LayerSynthState object
 * @internal
 */
function createLayerSynthState(partial: Partial<LayerSynthState> = {}): LayerSynthState {
    return {
        source: partial.source ?? new SynthSourceClass(),
        compiled: partial.compiled,
        shader: partial.shader,
        characterResolver: partial.characterResolver ?? new CharacterResolver(),
        startTime: partial.startTime ?? performance.now() / 1000,
        needsCompile: partial.needsCompile ?? false,
        pingPongBuffers: partial.pingPongBuffers,
        pingPongIndex: partial.pingPongIndex ?? 0,
        externalLayerMap: partial.externalLayerMap,
        bpm: partial.bpm,
    };
}

/**
 * Extend layer with synth() method.
 * @internal
 */
export function extendLayerSynth(api: TextmodePluginAPI) {
    api.extendLayer('synth', function (this: TextmodeLayer, source: SynthSource): void {
        const now = performance.now() / 1000;
        const isInitialized = this.grid !== undefined && this.drawFramebuffer !== undefined;

        let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

        if (state) {
            // Update existing state
            state.source = source;
            state.startTime = now;
            state.needsCompile = true;
            state.characterResolver.invalidate();

            if (isInitialized) {
                state.compiled = compileSynthSource(source);
            }
        } else {
            // Create new state using factory
            state = createLayerSynthState({
                source,
                compiled: isInitialized ? compileSynthSource(source) : undefined,
                startTime: now,
                needsCompile: true,
            });
        }

        this.setPluginState(PLUGIN_NAME, state);
    });
}

/**
 * Extend layer with clearSynth() method.
 * @internal
 */
export function extendLayerClearSynth(api: TextmodePluginAPI) {
    api.extendLayer('clearSynth', function (this: TextmodeLayer): void {
        const state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);
        if (!state) return;

        // Dispose shader
        if (state.shader?.dispose) {
            state.shader.dispose();
        }

        // Dispose ping-pong buffers
        if (state.pingPongBuffers) {
            state.pingPongBuffers[0].dispose?.();
            state.pingPongBuffers[1].dispose?.();
        }

        // Clear plugin state
        this.setPluginState(PLUGIN_NAME, undefined);
    });
}

/**
 * Extend layer with bpm() method.
 * @internal
 */
export function extendLayerBpm(api: TextmodePluginAPI) {
    api.extendLayer('bpm', function (this: TextmodeLayer, value: number): void {
        let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

        if (state) {
            // Update existing state
            state.bpm = value;
        } else {
            // Create minimal state to store BPM using factory
            state = createLayerSynthState({ bpm: value });
        }

        this.setPluginState(PLUGIN_NAME, state);
    });
}
