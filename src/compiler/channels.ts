import type { CompilationTarget } from './types';

/**
 * Texture channels used in the synthesis pipeline.
 * - `charColor`: The character color output
 * - `char`: The character data output
 * - `cellColor`: The cell background color output
 */
export type TextureChannel = 'charColor' | 'char' | 'cellColor';

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
 * Get the texture channel associated with a compilation target.
 *
 * Maps the compilation context (where we are in the chain) to the
 * texture channel that should be sampled by default.
 *
 * @param target - The current compilation target
 * @returns The corresponding texture channel
 */
export function getTextureChannel(target: CompilationTarget): TextureChannel {
	switch (target) {
		case 'char':
			return 'char';
		case 'cellColor':
			return 'cellColor';
		case 'charColor':
		case 'main':
		default:
			return 'charColor';
	}
}
