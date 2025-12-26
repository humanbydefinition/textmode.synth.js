/**
 * CharacterResolver - Handles font character resolution for synth rendering.
 * 
 * This module manages the mapping from character indices to font atlas
 * positions, with caching for performance.
 */

import type { loadables } from 'textmode.js';

/**
 * Resolver for character indices using font data.
 */
export class CharacterResolver {
	private _resolvedIndices?: Int32Array;
	private _lastFontCharacterCount = 0;
	private _lastChars = '';

	/**
	 * Resolve character indices using the font's character map.
	 * Caches the result to avoid repeated lookups.
	 * 
	 * @param chars The character string to resolve
	 * @param font The font to use for resolution
	 * @returns Array of resolved font indices
	 */
	public resolve(chars: string, font: loadables.TextmodeFont): Int32Array {
		// Check if we can reuse cached indices
		const fontCharCount = font.characters.length;
		if (
			this._resolvedIndices &&
			this._lastFontCharacterCount === fontCharCount &&
			this._lastChars === chars
		) {
			return this._resolvedIndices;
		}

		const charArray = Array.from(chars);
		const indices = new Int32Array(charArray.length);
		const characters = font.characters;

		// Build a reverse lookup: character string -> index in font
		const charToIndex = new Map<string, number>();
		for (let i = 0; i < characters.length; i++) {
			charToIndex.set(characters[i].character, i);
		}

		// Resolve each character in the charMap to its font index
		for (let i = 0; i < charArray.length; i++) {
			const char = charArray[i];
			const fontIndex = charToIndex.get(char);
			if (fontIndex !== undefined) {
				indices[i] = fontIndex;
			} else {
				// Character not found in font, use space or first character
				indices[i] = charToIndex.get(' ') ?? 0;
				console.warn(`[CharacterResolver] Character '${char}' not found in font, using fallback`);
			}
		}

		// Cache for reuse
		this._resolvedIndices = indices;
		this._lastFontCharacterCount = fontCharCount;
		this._lastChars = chars;

		return indices;
	}

	/**
	 * Invalidate the cache.
	 */
	public invalidate(): void {
		this._resolvedIndices = undefined;
		this._lastFontCharacterCount = 0;
		this._lastChars = '';
	}
}
