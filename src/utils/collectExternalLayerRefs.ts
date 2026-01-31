import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from '../core/SynthSource';

/**
 * Collect all external layer references from a SynthSource and its nested chains.
 */
export function collectExternalLayerRefs(source: SynthSource): Map<string, TextmodeLayer> {
	const layers = new Map<string, TextmodeLayer>();

	// Collect from main source
	for (const [, ref] of source.externalLayerRefs) {
		layers.set(ref.layerId, ref.layer);
	}

	// Collect from nested sources
	for (const [, nested] of source.nestedSources) {
		const nestedRefs = collectExternalLayerRefs(nested);
		for (const [id, layer] of nestedRefs) {
			layers.set(id, layer);
		}
	}

	// Collect from charSource
	if (source.charSource) {
		const charRefs = collectExternalLayerRefs(source.charSource);
		for (const [id, layer] of charRefs) {
			layers.set(id, layer);
		}
	}

	// Collect from colorSource
	if (source.charColorSource) {
		const colorRefs = collectExternalLayerRefs(source.charColorSource);
		for (const [id, layer] of colorRefs) {
			layers.set(id, layer);
		}
	}

	// Collect from cellColorSource
	if (source.cellColorSource) {
		const cellRefs = collectExternalLayerRefs(source.cellColorSource);
		for (const [id, layer] of cellRefs) {
			layers.set(id, layer);
		}
	}

	return layers;
}
