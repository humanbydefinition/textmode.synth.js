import type { CompilationTarget, ChannelUsage } from './types';
import type { TextureChannel } from '../core/types';

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

/**
 * Updates the channel usage flags based on the compilation target.
 *
 * @param usage - The channel usage flags to update
 * @param target - The current compilation target
 */
export function updateChannelUsage(usage: ChannelUsage, target: CompilationTarget): void {
	const channel = getTextureChannel(target);
	if (channel === 'char') {
		usage.usesChar = true;
	} else if (channel === 'cellColor') {
		usage.usesCellColor = true;
	} else {
		usage.usesCharColor = true;
	}
}
