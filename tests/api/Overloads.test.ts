import { describe, it, expect } from 'vitest';
import '../../src/bootstrap';
import { osc, noise } from '../../src/api';
import { SynthSource } from '../../src/core/SynthSource';

describe('API Overloads', () => {
    it('should support primitive values in combine transforms (add)', () => {
        const source = osc().add(0.5);

        // Check if the nested source is a solid color
        const nestedSources = source.nestedSources;
        expect(nestedSources.size).toBe(1);

        const nested = nestedSources.get(1); // 0 is osc, 1 is add which has a nested source
        expect(nested).toBeDefined();
        expect(nested?.transforms[0].name).toBe('solid');
        expect(nested?.transforms[0].userArgs).toEqual([0.5, null, null, null]);
    });

    it('should support primitive values in combineCoord transforms (modulate)', () => {
        const source = osc().modulate(0.1);

        const nestedSources = source.nestedSources;
        expect(nestedSources.size).toBe(1);

        const nested = nestedSources.get(1);
        expect(nested).toBeDefined();
        expect(nested?.transforms[0].name).toBe('solid');
        expect(nested?.transforms[0].userArgs).toEqual([0.1, null, null, null]);
    });

    it('should support array values in combine transforms (mult)', () => {
        const source = osc().mult([1, 0.5, 0]);

        const nestedSources = source.nestedSources;
        expect(nestedSources.get(1)).toBeDefined();
        expect(nestedSources.get(1)?.transforms[0].userArgs).toEqual([[1, 0.5, 0], null, null, null]);
    });

    it('should still support SynthSource objects', () => {
        const modSource = noise();
        const source = osc().modulate(modSource);

        const nestedSources = source.nestedSources;
        const nested = nestedSources.get(1);

        // Should be the exact same instance
        expect(nested).toBe(modSource);
    });

    it('should preserve existing behavior for paint/charColor (RGBA support)', () => {
        const source = osc().paint(1, 0, 0, 1);

        // paint is manually implemented, checks colorSource/cellColorSource
        expect(source.colorSource).toBeDefined();
        expect(source.colorSource?.transforms[0].name).toBe('solid');
        // paint passes all args to solid
        expect(source.colorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });
});
