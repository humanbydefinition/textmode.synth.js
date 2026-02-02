import { TextmodeSource } from 'textmode.js/loadables';
import type { SynthSource } from '../core/SynthSource';

/**
 * Collect all TextmodeSource references from a SynthSource and its nested chains.
 * Returns a map of source IDs to their TextmodeSource objects.
 */
export function collectTextmodeSourceRefs(source: SynthSource): Map<string, TextmodeSource> {
	const sources = new Map<string, TextmodeSource>();

	// Collect from main source
	for (const [, ref] of source.textmodeSourceRefs) {
		sources.set(ref.sourceId, ref.source);
	}

	// Collect from nested sources
	for (const [, nested] of source.nestedSources) {
		const nestedRefs = collectTextmodeSourceRefs(nested);
		for (const [id, src] of nestedRefs) {
			sources.set(id, src);
		}
	}

	// Collect from charSource
	if (source.charSource) {
		const charRefs = collectTextmodeSourceRefs(source.charSource);
		for (const [id, src] of charRefs) {
			sources.set(id, src);
		}
	}

	// Collect from colorSource
	if (source.charColorSource) {
		const colorRefs = collectTextmodeSourceRefs(source.charColorSource);
		for (const [id, src] of colorRefs) {
			sources.set(id, src);
		}
	}

	// Collect from cellColorSource
	if (source.cellColorSource) {
		const cellRefs = collectTextmodeSourceRefs(source.cellColorSource);
		for (const [id, src] of cellRefs) {
			sources.set(id, src);
		}
	}

	return sources;
}
