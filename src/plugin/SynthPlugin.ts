import type { TextmodePlugin, TextmodePluginContext, TextmodeLayer } from 'textmode.js';
import packageMetadata from '../../package.json';

import { PLUGIN_NAME } from './constants';
import {
	extendLayerSynth,
	extendLayerBpm,
	extendLayerClearSynth,
	extendTextmodifierBpm,
	extendTextmodifierSeed,
	extendTextmodifierSynth,
} from '../extensions';
import { synthRender, synthDispose, shaderManager } from '../lifecycle';
import type { LayerSynthState } from '../core/types';

/**
 * textmode.synth.js plugin for textmode.js.
 *
 * Adds procedural synthesis to {@link TextmodeLayer} instances through the
 * native textmode.js plugin system. Layer extensions (`synth`, `clearSynth`,
 * `bpm`) and Textmodifier extensions (`synth`, `bpm`, `seed`) are registered
 * via {@link TextmodePluginContext.defineExtension}, so the host owns their
 * cleanup when the plugin is uninstalled.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/variables/SynthPlugin | SynthPlugin API reference}
 */
export const SynthPlugin: TextmodePlugin = {
	name: PLUGIN_NAME,
	version: packageMetadata.version,

	install(textmodifier, api: TextmodePluginContext) {
		shaderManager.reset();

		extendTextmodifierBpm(api);
		extendTextmodifierSeed(api);
		extendTextmodifierSynth(api);
		extendLayerSynth(api);
		extendLayerBpm(api);
		extendLayerClearSynth(api);

		api.registerPreSetupHook(async () => {
			await shaderManager.initialize(textmodifier);
		});

		api.registerLayerPreRenderHook((layer: TextmodeLayer) => synthRender(layer, textmodifier));
		api.registerLayerDisposedHook(synthDispose);
	},

	uninstall(textmodifier, _api: TextmodePluginContext) {
		const allLayers = [textmodifier.layers.base, ...textmodifier.layers.all];
		for (const layer of allLayers) {
			const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			if (state) {
				state.isDisposed = true;
				if (state.shader?.dispose) {
					state.shader.dispose();
				}
				if (state.pingPongBuffers) {
					state.pingPongBuffers[0].dispose?.();
					state.pingPongBuffers[1].dispose?.();
				}
				layer.setPluginState(PLUGIN_NAME, undefined);
			}
		}

		// Layer and Textmodifier extension properties are removed by the
		// plugin runtime's extension registry on uninstall.

		shaderManager.dispose();
	},
};
