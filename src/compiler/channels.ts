import type { CompilationTarget } from './types';

/**
 * Texture channels used in the synthesis pipeline.
 * - `primary`: The main color output (corresponds to charColor/main context)
 * - `char`: The character data output
 * - `cell`: The cell background color output
 */
export type TextureChannel = 'primary' | 'char' | 'cell';

/**
 * Mapping from texture channel to self-feedback sampler uniform name.
 */
export const CHANNEL_SAMPLERS: Record<TextureChannel, string> = {
	primary: 'prevCharColorBuffer',
	char: 'prevCharBuffer',
	cell: 'prevCellColorBuffer',
};

/**
 * Mapping from texture channel to external layer uniform suffix.
 */
export const CHANNEL_SUFFIXES: Record<TextureChannel, string> = {
	primary: '_primary',
	char: '_char',
	cell: '_cell',
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
			return 'cell';
		case 'charColor':
		case 'main':
		default:
			return 'primary';
	}
}
