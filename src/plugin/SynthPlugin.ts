import type { TextmodePlugin, TextmodePluginContext, TextmodeLayer, Textmodifier } from 'textmode.js';
import packageMetadata from '../../package.json';

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

/**
 * textmode.synth.js plugin for textmode.js.
 *
 * Adds procedural synthesis to {@link TextmodeLayer} instances through the
 * native textmode.js plugin system. Layer extensions (`synth`, `clearSynth`,
 * `bpm`) and Textmodifier extensions (`synth`, `bpm`, `seed`) are registered
 * via {@link TextmodePluginContext.defineExtension}, so the host owns their
 * cleanup when the plugin is removed.
 *
 * @category Workflow
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/variables/SynthPlugin | SynthPlugin API reference}
 */
export const SynthPlugin: TextmodePlugin = {
	name: packageMetadata.name,

	install(textmodifier: Textmodifier, api: TextmodePluginContext): () => void {
		const shaderManager = new ShaderManager();

		try {
			extendTextmodifierBpm(api);
			extendTextmodifierSeed(api);
			extendTextmodifierSynth(api);
			extendLayerSynth(api);
			extendLayerBpm(api);
			extendLayerClearSynth(api);

			api.on('preSetup', async () => {
				await shaderManager.initialize(textmodifier);
			});

			api.on('layerPreRender', (layer: TextmodeLayer) =>
				synthRender(layer, textmodifier, shaderManager.getShader())
			);
			api.on('layerDisposed', synthDispose);
		} catch (error) {
			shaderManager.dispose();
			throw error;
		}

		return () => {
			for (const layer of [textmodifier.layers.base, ...textmodifier.layers.all]) synthDispose(layer);
			clearSynthState(textmodifier);
			shaderManager.dispose();
		};
	},
};
