import type { Textmodifier } from 'textmode.js';
import type { TextmodePlugin, TextmodePluginAPI } from 'textmode.js/plugins';

import { PLUGIN_NAME } from './constants';
import {
	extendLayerSynth,
	extendLayerBpm,
	extendLayerClearSynth,
	extendTextmodifierBpm,
	extendTextmodifierSeed,
} from '../extensions';
import { synthRender, synthDispose, shaderManager } from '../lifecycle';
import type { LayerSynthState } from '../core/types';

/**
 * The `textmode.synth.js` plugin to install.
 *
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 *
 * @example
 * ```javascript
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * t.layers.base.synth(
 *   noise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5, 0.1, 1.2).kaleid(4))
 * );
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 */
export const SynthPlugin: TextmodePlugin = {
	name: PLUGIN_NAME,
	version: '1.5.0',

	install(textmodifier, api: TextmodePluginAPI) {
		// Reset copy shader manager in case of plugin reinstall
		shaderManager.reset();

		// Extensions
		extendTextmodifierBpm(textmodifier);
		extendTextmodifierSeed(textmodifier);
		extendLayerSynth(api);
		extendLayerBpm(api);
		extendLayerClearSynth(api);

		// Pre-setup hook: initialize the copy shader once before user code runs
		api.registerPreSetupHook(async () => {
			await shaderManager.initialize(textmodifier);
		});

		// Lifecycle callbacks
		api.registerLayerPreRenderHook((layer) => synthRender(layer, textmodifier));
		api.registerLayerDisposedHook(synthDispose);
	},

	uninstall(textmodifier, api: TextmodePluginAPI) {
		// Clean up all synth states
		const allLayers = [api.layerManager.base, ...api.layerManager.all];
		for (const layer of allLayers) {
			const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			if (state) {
				// Mark as disposed to prevent pending async operations from continuing
				state.isDisposed = true;

				if (state.shader?.dispose) {
					state.shader.dispose();
				}
				if (state.pingPongBuffers) {
					state.pingPongBuffers[0].dispose?.();
					state.pingPongBuffers[1].dispose?.();
				}

				// Remove state from layer
				layer.setPluginState(PLUGIN_NAME, undefined);
			}
		}

		// Remove textmodifier extensions
		delete (textmodifier as Partial<Textmodifier>).bpm;
		delete (textmodifier as Partial<Textmodifier & { seed?: unknown }>).seed;

		// Remove layer extensions
		api.removeLayerExtension('synth');
		api.removeLayerExtension('bpm');
		api.removeLayerExtension('clearSynth');

		// Dispose global copy shader
		shaderManager.dispose();
	},
};
