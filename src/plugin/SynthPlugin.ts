import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginAPI } from 'textmode.js/plugins';

import { PLUGIN_NAME } from './constants';
import {
	extendLayerSynth,
	extendLayerBpm,
	extendLayerClearSynth,
	extendTextmodifierBpm,
} from '../extensions';
import { synthRender, synthDispose } from '../lifecycle';
import type { LayerSynthState } from '../core/types';

/**
 * The `textmode.synth.js` plugin to install.
 *
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js'; // es module imports
 * import { SynthPlugin, noise, osc } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * t.layers.base.synth(
 *   noise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5).kaleid(4))
 * );
 * ```
 */
export const SynthPlugin: TextmodePlugin = {
	name: PLUGIN_NAME,
	version: '1.0.0',

	install(textmodifier, api: TextmodePluginAPI) {
		// Extensions
		extendTextmodifierBpm(textmodifier);
		extendLayerSynth(api);
		extendLayerBpm(api);
		extendLayerClearSynth(api);

		// Lifecycle callbacks
		api.registerLayerPreRenderHook((layer) => synthRender(layer, textmodifier));
		api.registerLayerDisposedHook(synthDispose);
	},

	uninstall(_textmodifier, api: TextmodePluginAPI) {
		// Clean up all synth states
		const allLayers = [api.layerManager.base, ...api.layerManager.all];
		for (const layer of allLayers) {
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

		// Remove textmodifier extensions
		delete (_textmodifier as Partial<Textmodifier>).bpm;

		// Remove layer extensions
		api.removeLayerExtension('synth');
		api.removeLayerExtension('bpm');
		api.removeLayerExtension('clearSynth');
	},
};
