import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { TextmodeLayer } from 'textmode.js/layering';
import { PLUGIN_NAME } from '../constants';
import type { LayerSynthState } from '../types/LayerSynthState';

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
