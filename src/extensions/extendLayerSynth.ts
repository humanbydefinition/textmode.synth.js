import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from '../core/SynthSource';
import { PLUGIN_NAME } from '../constants';
import type { LayerSynthState } from '../types/LayerSynthState';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { CharacterResolver } from '../utils/CharacterResolver';

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
            // Create new state
            state = {
                source,
                compiled: isInitialized ? compileSynthSource(source) : undefined,
                shader: undefined,
                characterResolver: new CharacterResolver(),
                startTime: now,
                needsCompile: true,
                pingPongBuffers: undefined,
                pingPongIndex: 0,
            };
        }

        this.setPluginState(PLUGIN_NAME, state);
    });
}
