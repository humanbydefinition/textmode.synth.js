import type { TextmodePlugin, TextmodePluginContext, TextmodeLayer, Textmodifier } from 'textmode.js';
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
import { ShaderManager, synthDispose, synthRender } from '../lifecycle';
import { clearSynthState } from '../extensions/textmodifier';

const shaderManagers = new WeakMap<Textmodifier, ShaderManager>();

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
		const shaderManager = new ShaderManager();
		shaderManagers.set(textmodifier, shaderManager);

		extendTextmodifierBpm(api);
		extendTextmodifierSeed(api);
		extendTextmodifierSynth(api);
		extendLayerSynth(api);
		extendLayerBpm(api);
		extendLayerClearSynth(api);

		api.on('preSetup', async () => {
			await shaderManager.initialize(textmodifier);
		});

		api.on('layerPreRender', (layer: TextmodeLayer) => synthRender(layer, textmodifier, shaderManager.getShader()));
		api.on('layerDisposed', synthDispose);
	},

	uninstall(textmodifier, _api: TextmodePluginContext) {
		for (const layer of [textmodifier.layers.base, ...textmodifier.layers.all]) synthDispose(layer);
		clearSynthState(textmodifier);

		// Layer and Textmodifier extension properties are removed by the
		// plugin runtime's extension registry on uninstall.

		shaderManagers.get(textmodifier)?.dispose();
		shaderManagers.delete(textmodifier);
	},
};
