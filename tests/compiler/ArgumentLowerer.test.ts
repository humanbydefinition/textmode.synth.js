import { describe, it, expect, beforeAll } from 'vitest';
import { ArgumentLowerer, formatInt, formatVector, formatNumber } from '../../src/compiler/ArgumentLowerer';
import { initArrayUtils } from '../../src/utils/ArrayUtils';
import type { NormalizedTransformInput } from '../../src/transforms/TransformDefinition';

function input(
	type: NormalizedTransformInput['type'],
	name: string,
	def: number | number[] | null
): NormalizedTransformInput {
	return { name, publicName: name, type, default: def };
}

describe('ArgumentLowerer', () => {
	beforeAll(() => {
		initArrayUtils();
	});

	describe('float inputs', () => {
		it('lowers static numbers with a decimal point', () => {
			const lowerer = new ArgumentLowerer();
			expect(lowerer.process(input('float', 'amount', 0.5), 8, 'p').glslValue).toBe('8.0');
			expect(lowerer.process(input('float', 'amount', 0.5), 0.25, 'p').glslValue).toBe('0.25');
		});

		it('lowers defaults for omitted values', () => {
			const lowerer = new ArgumentLowerer();
			expect(lowerer.process(input('float', 'amount', 0.5), undefined, 'p').glslValue).toBe('0.5');
			expect(lowerer.process(input('float', 'amount', 0.5), null, 'p').glslValue).toBe('0.5');
		});

		it('lowers callbacks to dynamic uniforms', () => {
			const lowerer = new ArgumentLowerer();
			const result = lowerer.process(input('float', 'amount', 0.5), () => 42, 'p');
			expect(result.glslValue).toBe('p_amount');
			expect(lowerer.getUniforms().get('p_amount')?.isDynamic).toBe(true);
			expect(lowerer.getDynamicUpdaters().has('p_amount')).toBe(true);
		});

		it('lowers modulated arrays to dynamic sequence uniforms', () => {
			const lowerer = new ArgumentLowerer();
			const value = [0, 1, 2].fast(1);
			const result = lowerer.process(input('float', 'amount', 0.5), value, 'p');
			expect(result.glslValue).toBe('p_amount');
			expect(lowerer.getDynamicUpdaters().get('p_amount')).toBeDefined();
		});
	});

	describe('int inputs', () => {
		it('lowers static integers without a decimal suffix', () => {
			const lowerer = new ArgumentLowerer();
			expect(lowerer.process(input('int', 'bins', 3), 8, 'p').glslValue).toBe('8');
			expect(lowerer.process(input('int', 'bins', 3), undefined, 'p').glslValue).toBe('3');
		});

		it('rejects non-integer static values', () => {
			const lowerer = new ArgumentLowerer();
			expect(() => lowerer.process(input('int', 'bins', 3), 8.5, 'p')).toThrow(/integer/);
		});

		it('rejects arrays for int inputs', () => {
			const lowerer = new ArgumentLowerer();
			expect(() => lowerer.process(input('int', 'bins', 3), [1, 2], 'p')).toThrow();
		});
	});

	describe('vector inputs', () => {
		it('lowers exact-length tuples to vecN literals', () => {
			const lowerer = new ArgumentLowerer();
			expect(lowerer.process(input('vec3', 'color', [0, 0, 0]), [1, 0.5, 0], 'p').glslValue).toBe(
				'vec3(1.0, 0.5, 0.0)'
			);
			expect(lowerer.process(input('vec2', 'scale', [1, 1]), [2, 3], 'p').glslValue).toBe('vec2(2.0, 3.0)');
			expect(lowerer.process(input('vec4', 'rgba', [0, 0, 0, 1]), [1, 1, 1, 1], 'p').glslValue).toBe(
				'vec4(1.0, 1.0, 1.0, 1.0)'
			);
		});

		it('lowers default tuples for omitted values', () => {
			const lowerer = new ArgumentLowerer();
			expect(lowerer.process(input('vec3', 'color', [0.02, 0.04, 0.12]), undefined, 'p').glslValue).toBe(
				'vec3(0.02, 0.04, 0.12)'
			);
		});

		it('lowers callbacks to dynamic vector uniforms', () => {
			const lowerer = new ArgumentLowerer();
			const result = lowerer.process(input('vec3', 'color', [0, 0, 0]), () => [1, 0, 0], 'p');
			expect(result.glslValue).toBe('p_color');
			const uniform = lowerer.getUniforms().get('p_color');
			expect(uniform?.type).toBe('vec3');
			expect(uniform?.isDynamic).toBe(true);
		});

		it('treats a number array as vector data, not a time sequence', () => {
			const lowerer = new ArgumentLowerer();
			// A modulated scalar array is NOT accepted as vector data.
			expect(() => lowerer.process(input('vec2', 'v', [1, 1]), [1, 2, 3], 'p')).toThrow(/exactly 2 numbers/);
		});

		it('rejects plain numbers for vector inputs', () => {
			const lowerer = new ArgumentLowerer();
			expect(() => lowerer.process(input('vec3', 'v', [0, 0, 0]), 5, 'p')).toThrow();
		});
	});

	describe('formatters', () => {
		it('formatInt never emits a decimal suffix', () => {
			expect(formatInt(3)).toBe('3');
			expect(formatInt(3.9)).toBe('3');
		});

		it('formatNumber keeps float formatting', () => {
			expect(formatNumber(3)).toBe('3.0');
			expect(formatNumber(0.5)).toBe('0.5');
		});

		it('formatVector builds a typed literal', () => {
			expect(formatVector('vec2', [1, 2])).toBe('vec2(1.0, 2.0)');
		});
	});
});
