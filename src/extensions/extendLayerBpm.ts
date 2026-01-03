import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { TextmodeLayer } from 'textmode.js/layering';
import { PLUGIN_NAME } from '../constants';
import type { LayerSynthState } from '../types/LayerSynthState';
import { CharacterResolver } from '../utils/CharacterResolver';
import { SynthSource } from '../core/SynthSource';

export function extendLayerBpm(api: TextmodePluginAPI) {
    api.extendLayer('bpm', function (this: TextmodeLayer, value: number): void {
        let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

        if (state) {
            // Update existing state
            state.bpm = value;
        } else {
            // Create minimal state to store BPM
            const now = performance.now() / 1000;
            state = {
                source: new SynthSource(), // Placeholder, will be replaced on synth call
                compiled: undefined,
                shader: undefined,
                characterResolver: new CharacterResolver(),
                startTime: now,
                needsCompile: false,
                pingPongBuffers: undefined,
                pingPongIndex: 0,
                bpm: value,
            };
        }

        this.setPluginState(PLUGIN_NAME, state);
    });
}
