import type { TextmodeLayer } from 'textmode.js/layering';
import { PLUGIN_NAME } from '../constants';
import type { LayerSynthState } from '../types/LayerSynthState';

/**
 * Hook to clean up synth resources when a layer is disposed.
 */
export function useSynthDispose(layer: TextmodeLayer) {
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
