import type { loadables } from 'textmode.js';
/**
 * Resolver for character indices using font data.
 * @ignore
 */
export declare class CharacterResolver {
    private _resolvedIndices?;
    private _lastFontCharacterCount;
    private _lastChars;
    /**
     * Resolve character indices using the font's character map.
     * Caches the result to avoid repeated lookups.
     *
     * @param chars The character string to resolve
     * @param font The font to use for resolution
     * @returns Array of resolved font indices
     */
    resolve(chars: string, font: loadables.TextmodeFont): Int32Array;
    /**
     * Invalidate the cache.
     */
    invalidate(): void;
}
//# sourceMappingURL=CharacterResolver.d.ts.map