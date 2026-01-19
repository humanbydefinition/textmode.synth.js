import type { TextmodeFont, TextmodeCharacter } from 'textmode.js/loadables';

/**
 * Resolver for character indices using font data.
 * Caches resolved indices to avoid repeated lookups.
 */
export class CharacterResolver {
	// Cache for character -> index mapping per font
	private static _fontIndexCache = new WeakMap<TextmodeFont, Map<TextmodeCharacter, number>>();

	private _resolvedIndices?: Int32Array;
	private _lastFont?: TextmodeFont;
	private _lastChars = '';

	/**
	 * Resolve character indices using the font's character map.
	 * @param chars The character string to resolve
	 * @param font The font to use for resolution
	 * @returns Array of resolved font indices
	 */
	public resolve(chars: string, font: TextmodeFont): Int32Array {
		if (this._resolvedIndices && this._lastFont === font && this._lastChars === chars) {
			return this._resolvedIndices;
		}

		// Get or build the index map for this font
		let indexMap = CharacterResolver._fontIndexCache.get(font);
		if (!indexMap) {
			indexMap = new Map<TextmodeCharacter, number>();
			const characters = font.characters;
			for (let i = 0; i < characters.length; i++) {
				indexMap.set(characters[i], i);
			}
			CharacterResolver._fontIndexCache.set(font, indexMap);
		}

		const charArray = Array.from(chars);
		const indices = new Int32Array(charArray.length);
		const characterMap = font.characterMap;

		// Pre-calculate fallback index (usually space)
		const spaceChar = characterMap.get(' ');
		const fallbackIndex = spaceChar && indexMap.has(spaceChar) ? indexMap.get(spaceChar)! : 0;

		for (let i = 0; i < charArray.length; i++) {
			const char = charArray[i];
			const charData = characterMap.get(char);

			if (charData) {
				const idx = indexMap.get(charData);
				indices[i] = idx !== undefined ? idx : fallbackIndex;
			} else {
				indices[i] = fallbackIndex;
			}
		}

		this._resolvedIndices = indices;
		this._lastFont = font;
		this._lastChars = chars;

		return indices;
	}

	public invalidate(): void {
		this._resolvedIndices = undefined;
		this._lastFont = undefined;
		this._lastChars = '';
	}
}
