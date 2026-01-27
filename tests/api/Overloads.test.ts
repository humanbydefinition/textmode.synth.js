import { describe, it, expect } from 'vitest';
import '../../src/bootstrap';
import { osc, noise, solid, cellColor, charColor, paint, char } from '../../src/api';

describe('API Overloads', () => {
    it('should support primitive values in combine transforms (add)', () => {
        const source = osc().add(0.5);

        // Check if the nested source is a solid color
        const nestedSources = source.nestedSources;
        expect(nestedSources.size).toBe(1);

        const nested = nestedSources.get(1); // 0 is osc, 1 is add which has a nested source
        expect(nested).toBeDefined();
        expect(nested?.transforms[0].name).toBe('solid');
        // Expect duplicated args for scalar behavior
        expect(nested?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, null]);
    });

    it('should support primitive values in combineCoord transforms (modulate)', () => {
        const source = osc().modulate(0.1);

        const nestedSources = source.nestedSources;
        expect(nestedSources.size).toBe(1);

        const nested = nestedSources.get(1);
        expect(nested).toBeDefined();
        expect(nested?.transforms[0].name).toBe('solid');
        // Expect duplicated args for scalar behavior
        expect(nested?.transforms[0].userArgs).toEqual([0.1, 0.1, 0.1, null]);
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

    it('should support solid(gray) overload', () => {
        const source = solid(0.5);
        expect(source.transforms[0].name).toBe('solid');
        // Expect duplicated args (plus default alpha)
        expect(source.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
    });

    it('should support color(gray) overload', () => {
        const source = osc().color(0.5);
        expect(source.transforms[1].name).toBe('color');
        // Expect duplicated args (plus default alpha)
        expect(source.transforms[1].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
    });

    it('should support cellColor(source) overload', () => {
        const source = cellColor(osc(10));
        expect(source.cellColorSource).toBeDefined();
        expect(source.cellColorSource?.transforms[0].name).toBe('osc');
    });

    it('should support cellColor(r, g, b, a) overload', () => {
        const source = cellColor(1, 0, 0, 1);
        expect(source.cellColorSource).toBeDefined();
        expect(source.cellColorSource?.transforms[0].name).toBe('solid');
        expect(source.cellColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });

    it('should support charColor(source) overload', () => {
        const source = charColor(osc(10));
        expect(source.colorSource).toBeDefined();
        expect(source.colorSource?.transforms[0].name).toBe('osc');
    });

    it('should support charColor(r, g, b, a) overload', () => {
        const source = charColor(1, 0, 0, 1);
        expect(source.colorSource).toBeDefined();
        expect(source.colorSource?.transforms[0].name).toBe('solid');
        expect(source.colorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });

    it('should support char(source) overload', () => {
        const source = char(osc(10));
        expect(source.charSource).toBeDefined();
        expect(source.charSource?.transforms[0].name).toBe('osc');
    });

    it('should support char(value) overload', () => {
        const source = char(0.5);
        expect(source.charSource).toBeDefined();
        expect(source.charSource?.transforms[0].name).toBe('solid');
        // Expect duplicated args for scalar behavior (alpha defaults to 1 from solid() factory)
        expect(source.charSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
    });

    it('should support char(r, g, b) overload', () => {
        const source = char(1, 0, 0);
        expect(source.charSource).toBeDefined();
        expect(source.charSource?.transforms[0].name).toBe('solid');
        // Alpha defaults to 1 from solid() factory
        expect(source.charSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });

    it('should support paint(source) overload', () => {
        const source = paint(osc(10));
        expect(source.colorSource).toBeDefined();
        expect(source.cellColorSource).toBeDefined();
        expect(source.colorSource?.transforms[0].name).toBe('osc');
    });

    it('should support paint(r, g, b, a) overload', () => {
        const source = paint(1, 0, 0, 1);
        expect(source.colorSource).toBeDefined();
        expect(source.cellColorSource).toBeDefined();
        expect(source.colorSource?.transforms[0].name).toBe('solid');
        expect(source.colorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });
});
