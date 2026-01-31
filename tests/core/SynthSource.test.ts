import { describe, it, expect } from 'vitest';
import '../../src/bootstrap';
import { SynthSource } from '../../src/core/SynthSource';
import { solid, charColor, cellColor, paint } from '../../src/api/sources';

describe('SynthSource', () => {
    it('should support solid() in charColor (baseline)', () => {
        const source = new SynthSource();
        const color = solid(1, 0, 0, 1);
        source.charColor(color);

        expect(source.charColorSource).toBeDefined();
        expect(source.charColorSource?.transforms[0].name).toBe('solid');
        expect(source.charColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
    });

    it('should support RGBA overloads in charColor (chaining)', () => {
        const source = new SynthSource();
        source.charColor(0.5, 0.2, 0.1, 1);

        expect(source.charColorSource).toBeDefined();
        expect(source.charColorSource?.transforms).toBeDefined();
        expect(source.charColorSource?.transforms[0].name).toBe('solid');
        expect(source.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.2, 0.1, 1]);
    });

    it('should support RGBA overloads in cellColor (chaining)', () => {
        const source = new SynthSource();
        source.cellColor(0, 1, 0, 0.5);

        expect(source.cellColorSource).toBeDefined();
        expect(source.cellColorSource?.transforms).toBeDefined();
        expect(source.cellColorSource?.transforms[0].name).toBe('solid');
        expect(source.cellColorSource?.transforms[0].userArgs).toEqual([0, 1, 0, 0.5]);
    });

    it('should support RGBA overloads in paint (chaining)', () => {
        const source = new SynthSource();
        source.paint(1, 1, 1, 1);

        expect(source.charColorSource).toBeDefined();
        expect(source.cellColorSource).toBeDefined();
        expect(source.charColorSource?.transforms).toBeDefined();
        expect(source.charColorSource?.transforms[0].name).toBe('solid');
        expect(source.cellColorSource?.transforms[0].name).toBe('solid');
    });

    it('should support RGBA overloads in standalone functions', () => {
        const s1 = charColor(1, 0, 0);
        expect(s1.charColorSource).toBeDefined();
        expect(s1.charColorSource?.transforms).toBeDefined();
        expect(s1.charColorSource?.transforms[0].name).toBe('solid');
        // Args might have undefined if not passed
        const args = s1.charColorSource?.transforms[0].userArgs;
        expect(args?.[0]).toBe(1);
        expect(args?.[1]).toBe(0);
        expect(args?.[2]).toBe(0);

        const s2 = cellColor(0, 1, 0);
        expect(s2.cellColorSource).toBeDefined();
        expect(s2.cellColorSource?.transforms).toBeDefined();
        expect(s2.cellColorSource?.transforms[0].name).toBe('solid');

        const s3 = paint(0, 0, 1);
        expect(s3.charColorSource).toBeDefined();
        expect(s3.cellColorSource).toBeDefined();
        expect(s3.charColorSource?.transforms).toBeDefined();
        expect(s3.charColorSource?.transforms[0].name).toBe('solid');
        expect(s3.cellColorSource?.transforms[0].name).toBe('solid');
    });

    it('should support scalar expansion for single numeric argument', () => {
        const source = new SynthSource();

        // Scalar expansion for charColor
        source.charColor(0.5);
        expect(source.charColorSource).toBeDefined();
        expect(source.charColorSource?.transforms[0].name).toBe('solid');
        // Should expand 0.5 to [0.5, 0.5, 0.5, null]
        expect(source.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, null]);

        // Scalar expansion for cellColor
        source.cellColor(0.2);
        expect(source.cellColorSource).toBeDefined();
        expect(source.cellColorSource?.transforms[0].name).toBe('solid');
        expect(source.cellColorSource?.transforms[0].userArgs).toEqual([0.2, 0.2, 0.2, null]);

        // Scalar expansion for paint
        const source2 = new SynthSource();
        source2.paint(0.8);
        expect(source2.charColorSource).toBeDefined();
        expect(source2.charColorSource?.transforms[0].userArgs).toEqual([0.8, 0.8, 0.8, null]);
        expect(source2.cellColorSource?.transforms[0].userArgs).toEqual([0.8, 0.8, 0.8, null]);
    });
});
