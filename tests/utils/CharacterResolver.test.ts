import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterResolver } from '../../src/utils/CharacterResolver';
import type { TextmodeFont, TextmodeCharacter } from 'textmode.js/loadables';

describe('CharacterResolver', () => {
    let resolver: CharacterResolver;
    let mockFont: TextmodeFont;
    let mockFont2: TextmodeFont;

    // Mock characters
    // We use a simple object mock. The resolver only cares about object identity
    // for the map lookups, so the content of these objects doesn't strictly matter
    // as long as they are consistent.
    const charA = { id: 'A' } as unknown as TextmodeCharacter;
    const charB = { id: 'B' } as unknown as TextmodeCharacter;
    const charSpace = { id: ' ' } as unknown as TextmodeCharacter;
    const charC = { id: 'C' } as unknown as TextmodeCharacter;

    beforeEach(() => {
        resolver = new CharacterResolver();

        mockFont = {
            characters: [charA, charB, charSpace],
            characterMap: new Map([
                ['A', charA],
                ['B', charB],
                [' ', charSpace],
            ]),
        } as unknown as TextmodeFont;

        mockFont2 = {
            characters: [charC, charSpace, charA], // Different order/content
            characterMap: new Map([
                ['C', charC],
                [' ', charSpace],
                ['A', charA],
            ]),
        } as unknown as TextmodeFont;
    });

    describe('resolve', () => {
        it('should correctly resolve characters to their indices', () => {
            const indices = resolver.resolve('AB ', mockFont);
            // 'A' is at index 0, 'B' is at 1, ' ' is at 2 in mockFont.characters
            expect(Array.from(indices)).toEqual([0, 1, 2]);
        });

        it('should handle unknown characters by falling back to space index', () => {
            const indices = resolver.resolve('AXB', mockFont);
            // 'X' is unknown. Space is at index 2.
            // Expected: 0 (A), 2 (Space/Fallback), 1 (B)
            expect(Array.from(indices)).toEqual([0, 2, 1]);
        });

        it('should fallback to 0 if space is not found or not in map', () => {
             const weirdFont = {
                characters: [charA],
                characterMap: new Map([['A', charA]])
             } as unknown as TextmodeFont;

             const indices = resolver.resolve('X', weirdFont);
             // Space is not in map, so fallback should be 0
             expect(Array.from(indices)).toEqual([0]);
        });

        it('should cache result for same font and string', () => {
            const result1 = resolver.resolve('ABA', mockFont);
            const result2 = resolver.resolve('ABA', mockFont);
            expect(result1).toBe(result2); // Check referential equality
        });

        it('should update result when string changes', () => {
             const result1 = resolver.resolve('A', mockFont);
             const result2 = resolver.resolve('B', mockFont);
             expect(result1).not.toBe(result2);
             expect(Array.from(result1)).toEqual([0]);
             expect(Array.from(result2)).toEqual([1]);
        });

        it('should update result when font changes', () => {
             // mockFont: A is index 0
             // mockFont2: A is index 2
             const result1 = resolver.resolve('A', mockFont);
             const result2 = resolver.resolve('A', mockFont2);

             expect(Array.from(result1)).toEqual([0]);
             expect(Array.from(result2)).toEqual([2]);
        });
    });

    describe('invalidate', () => {
        it('should clear internal cache and force new array creation', () => {
            const result1 = resolver.resolve('A', mockFont);
            resolver.invalidate();
            const result2 = resolver.resolve('A', mockFont);

            expect(result1).not.toBe(result2); // Should be a new instance because cache was cleared
            expect(Array.from(result1)).toEqual(Array.from(result2)); // But content should be same
        });
    });
});
