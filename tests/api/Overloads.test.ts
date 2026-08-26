import { describe, it, expect } from 'vitest';
import '../../src/bootstrap';
import { osc, noise, solid, cellColor, charColor, paint } from '../../src/api';
import { SynthSource } from '../../src/core/SynthSource';

describe('API Overloads', () => {
	describe('combine transforms', () => {
		it('should support primitive values in combine transforms (add)', () => {
			const source = osc().add(0.5);
			const nestedSources = source.nestedSources;
			expect(nestedSources.size).toBe(1);

			const nested = nestedSources.get(1);
			expect(nested).toBeDefined();
			expect(nested?.transforms[0].name).toBe('solid');
			expect(nested?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});

		it('should support primitive values in combineCoord transforms (modulate)', () => {
			const source = osc().modulate(0.1);
			const nestedSources = source.nestedSources;
			expect(nestedSources.size).toBe(1);

			const nested = nestedSources.get(1);
			expect(nested).toBeDefined();
			expect(nested?.transforms[0].name).toBe('solid');
			expect(nested?.transforms[0].userArgs).toEqual([0.1, 0.1, 0.1, 1]);
		});

		it('should support array values in combine transforms (mult)', () => {
			const source = osc().mult([1, 0.5, 0]);
			const nestedSources = source.nestedSources;
			expect(nestedSources.get(1)).toBeDefined();
			expect(nestedSources.get(1)?.transforms[0].userArgs).toEqual([[1, 0.5, 0], null, null, null]);
		});

		it('should support SynthSource objects in combine transforms', () => {
			const modSource = noise();
			const source = osc().modulate(modSource);
			const nested = source.nestedSources.get(1);
			expect(nested).toBe(modSource);
		});
	});

	describe('solid / color scalar expansion', () => {
		it('should support solid(gray) overload', () => {
			const source = solid(0.5);
			expect(source.transforms[0].name).toBe('solid');
			expect(source.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});

		it('should support color(gray) overload', () => {
			const source = osc().color(0.5);
			expect(source.transforms[1].name).toBe('color');
			expect(source.transforms[1].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});
	});

	describe('standalone channel functions', () => {
		it('should support cellColor(source) and cellColor(r, g, b, a) overloads', () => {
			const s1 = cellColor(osc(10));
			expect(s1.cellColorSource?.transforms[0].name).toBe('osc');

			const s2 = cellColor(1, 0, 0, 1);
			expect(s2.cellColorSource?.transforms[0].name).toBe('solid');
			expect(s2.cellColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);

			const s3 = cellColor(0.5);
			expect(s3.cellColorSource?.transforms[0].name).toBe('solid');
			expect(s3.cellColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});

		it('should support charColor(source) and charColor(r, g, b, a) overloads', () => {
			const s1 = charColor(osc(10));
			expect(s1.charColorSource?.transforms[0].name).toBe('osc');

			const s2 = charColor(1, 0, 0, 1);
			expect(s2.charColorSource?.transforms[0].name).toBe('solid');
			expect(s2.charColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);

			const s3 = charColor(0.5);
			expect(s3.charColorSource?.transforms[0].name).toBe('solid');
			expect(s3.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});

		it('should support paint(source) and paint(r, g, b, a) overloads', () => {
			const s1 = paint(osc(10));
			expect(s1.charColorSource?.transforms[0].name).toBe('osc');
			expect(s1.cellColorSource?.transforms[0].name).toBe('osc');

			const s2 = paint(1, 0, 0, 1);
			expect(s2.charColorSource?.transforms[0].name).toBe('solid');
			expect(s2.cellColorSource?.transforms[0].name).toBe('solid');
			expect(s2.charColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
			expect(s2.cellColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);

			const s3 = paint(0.5);
			expect(s3.charColorSource?.transforms[0].name).toBe('solid');
			expect(s3.cellColorSource?.transforms[0].name).toBe('solid');
			expect(s3.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
			expect(s3.cellColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});
	});

	describe('chained channel methods on SynthSource', () => {
		it('should support solid() in charColor (baseline)', () => {
			const source = new SynthSource();
			const color = solid(1, 0, 0, 1);
			source.charColor(color);

			expect(source.charColorSource).toBeDefined();
			expect(source.charColorSource?.transforms[0].name).toBe('solid');
			expect(source.charColorSource?.transforms[0].userArgs).toEqual([1, 0, 0, 1]);
		});

		it('should support RGBA and scalar overloads in charColor (chaining)', () => {
			const source = new SynthSource();
			source.charColor(0.5, 0.2, 0.1, 1);
			expect(source.charColorSource?.transforms[0].name).toBe('solid');
			expect(source.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.2, 0.1, 1]);

			const source2 = new SynthSource();
			source2.charColor(0.5);
			expect(source2.charColorSource?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);
		});

		it('should support RGBA and scalar overloads in cellColor (chaining)', () => {
			const source = new SynthSource();
			source.cellColor(0, 1, 0, 0.5);
			expect(source.cellColorSource?.transforms[0].name).toBe('solid');
			expect(source.cellColorSource?.transforms[0].userArgs).toEqual([0, 1, 0, 0.5]);

			const source2 = new SynthSource();
			source2.cellColor(0.2);
			expect(source2.cellColorSource?.transforms[0].userArgs).toEqual([0.2, 0.2, 0.2, 1]);
		});

		it('should support RGBA and scalar overloads in paint (chaining)', () => {
			const source = new SynthSource();
			source.paint(1, 1, 1, 1);
			expect(source.charColorSource?.transforms[0].name).toBe('solid');
			expect(source.cellColorSource?.transforms[0].name).toBe('solid');
			expect(source.charColorSource?.transforms[0].userArgs).toEqual([1, 1, 1, 1]);
			expect(source.cellColorSource?.transforms[0].userArgs).toEqual([1, 1, 1, 1]);

			const source2 = new SynthSource();
			source2.paint(0.8);
			expect(source2.charColorSource?.transforms[0].userArgs).toEqual([0.8, 0.8, 0.8, 1]);
			expect(source2.cellColorSource?.transforms[0].userArgs).toEqual([0.8, 0.8, 0.8, 1]);
		});
	});
});
