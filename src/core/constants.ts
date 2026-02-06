/**
 * Core constants for the textmode.js synthesis system.
 */

import type { TextureChannel } from './types';

/**
 * Mapping from texture channel to self-feedback sampler uniform name.
 */
export const CHANNEL_SAMPLERS: Record<TextureChannel, string> = {
	charColor: 'prevCharColorBuffer',
	char: 'prevCharBuffer',
	cellColor: 'prevCellColorBuffer',
};

/**
 * Mapping from texture channel to external layer uniform suffix.
 */
export const CHANNEL_SUFFIXES: Record<TextureChannel, string> = {
	charColor: '_charColor',
	char: '_char',
	cellColor: '_cellColor',
};

/**
 * Transform type: Source generator
 */
export const TT_SRC = 'src';

/**
 * Transform type: Coordinate transform
 */
export const TT_COORD = 'coord';

/**
 * Transform type: Color transform
 */
export const TT_COLOR = 'color';

/**
 * Transform type: Combine (blend) transform
 */
export const TT_COMBINE = 'combine';

/**
 * Transform type: Coordinate modulation (combine coords)
 */
export const TT_COMBINE_COORD = 'combineCoord';

/**
 * Set of transform types that involve combining sources.
 */
export const COMBINE_TYPES = new Set([TT_COMBINE, TT_COMBINE_COORD]);

/**
 * Set of transform types that operatate on or produce coordinates.
 */
export const COORD_TYPES = new Set([TT_COORD, TT_COMBINE_COORD]);
