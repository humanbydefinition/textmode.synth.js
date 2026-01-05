/**
 * Synth dispose lifecycle callback.
 *
 * Cleans up synth resources when a layer is disposed.
 */

import type { TextmodeLayer } from 'textmode.js/layering';
import { PLUGIN_NAME } from '../plugin/constants';
import type { LayerSynthState } from '../core/types';

/**
 * Clean up synth resources when a layer is disposed.
 */
export function synthDispose(layer: TextmodeLayer) {
    const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
    if (state) {
        if (state.shader?.dispose) {
            state.shader.dispose();
        }
        if (state.pingPongBuffers) {
            state.pingPongBuffers[0].dispose?.();
            state.pingPongBuffers[1].dispose?.();
        }
    }
}
