import type { TextmodeFont } from 'textmode.js/loadables';
/**
 * Resolver for character indices using font data.
 * Caches resolved indices to avoid repeated lookups.
 */
export declare class CharacterResolver {
    private _resolvedIndices?;
    private _lastFontCharacterCount;
    private _lastChars;
    /**
     * Resolve character indices using the font's character map.
     * @param chars The character string to resolve
     * @param font The font to use for resolution
     * @returns Array of resolved font indices
     */
    resolve(chars: string, font: TextmodeFont): Int32Array;
    invalidate(): void;
}
//# sourceMappingURL=CharacterResolver.d.ts.map