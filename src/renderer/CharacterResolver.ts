import type { loadables } from 'textmode.js';

/**
 * Resolver for character indices using font data.
 * @ignore
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
		const characterMap = font.characterMap;
		const characters = font.characters;

		// Resolve each character to its font index using O(1) lookup
		for (let i = 0; i < charArray.length; i++) {
			const char = charArray[i];
			const charData = characterMap.get(char);
			if (charData !== undefined) {
				// Find the index of this character in the characters array
				indices[i] = characters.indexOf(charData);
			} else {
				// Character not found in font, use space or first character
				const fallback = characterMap.get(' ');
				indices[i] = fallback !== undefined ? characters.indexOf(fallback) : 0;
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
