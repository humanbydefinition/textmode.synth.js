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
