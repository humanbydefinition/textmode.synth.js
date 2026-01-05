import type { TextmodeFont } from 'textmode.js/loadables';

/**
 * Resolver for character indices using font data.
 * Caches resolved indices to avoid repeated lookups.
 */
export class CharacterResolver {
	private _resolvedIndices?: Int32Array;
	private _lastFontCharacterCount = 0;
	private _lastChars = '';

	/**
	 * Resolve character indices using the font's character map.
	 * @param chars The character string to resolve
	 * @param font The font to use for resolution
	 * @returns Array of resolved font indices
	 */
	public resolve(chars: string, font: TextmodeFont): Int32Array {
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

		for (let i = 0; i < charArray.length; i++) {
			const char = charArray[i];
			const charData = characterMap.get(char);
			if (charData !== undefined) {
				indices[i] = characters.indexOf(charData);
			} else {
				const fallback = characterMap.get(' ');
				indices[i] = fallback !== undefined ? characters.indexOf(fallback) : 0;
			}
		}

		this._resolvedIndices = indices;
		this._lastFontCharacterCount = fontCharCount;
		this._lastChars = chars;

		return indices;
	}

	public invalidate(): void {
		this._resolvedIndices = undefined;
		this._lastFontCharacterCount = 0;
		this._lastChars = '';
	}
}
