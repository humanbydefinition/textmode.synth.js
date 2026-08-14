import { describe, it, expect } from 'vitest';
import '../../src/index';
import { osc, noise, solid, src, char, cellColor } from '../../src/api';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import { CHANNEL_SAMPLERS } from '../../src/core/constants';

/**
 * Phase 1 behavior fixtures. These characterize observable compilation behavior
 * so the extensibility refactor cannot silently change built-in semantics.
 */

describe('public behavior fixtures', () => {
	it('applies coordinate transforms in reverse call order before the source', () => {
		const source = noise(8).kaleid(5).rotate(0.2);
		const shader = compileSynthSource(source).fragmentSource;
		const main = shader.slice(shader.indexOf('void main()'));

		// rotate() called last but applied first, then kaleid, then the source.
		const rotateIdx = main.indexOf('tm_rotate(main_st, 0.2, 0.0)');
		const kaleidIdx = main.indexOf('tm_kaleid(main_st, 5.0)');
		const noiseIdx = main.indexOf('tm_noise(main_st, 8.0, 0.1)');
		expect(rotateIdx).toBeGreaterThan(-1);
		expect(kaleidIdx).toBeGreaterThan(rotateIdx);
		expect(noiseIdx).toBeGreaterThan(kaleidIdx);
	});

	it('compiles nested combine chains at the current coordinate', () => {
		const shader = compileSynthSource(osc(6).add(osc(3))).fragmentSource;
		expect(shader).toContain('tm_add(');
		// Nested chain runs before the combine applies.
		const main = shader.slice(shader.indexOf('void main()'));
		expect(main.indexOf('tm_osc(main_nested_')).toBeGreaterThan(-1);
		expect(main.indexOf('tm_osc(main_st, 6.0')).toBeGreaterThan(-1);
	});

	it('selects the self-feedback target from the compilation context', () => {
		// src() at main level samples previous primary color.
		const mainShader = compileSynthSource(src()).fragmentSource;
		expect(mainShader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.charColor};`);

		// src() inside char() samples previous character data.
		const charShader = compileSynthSource(char(src())).fragmentSource;
		expect(charShader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.char};`);

		// src() inside cellColor() samples previous cell color.
		const cellShader = compileSynthSource(cellColor(src())).fragmentSource;
		expect(cellShader).toContain(`uniform sampler2D ${CHANNEL_SAMPLERS.cellColor};`);
	});

	it('derives characters from color luminance when no char() source is given', () => {
		const shader = compileSynthSource(solid(0.5)).fragmentSource;
		expect(shader).toContain('float lum = _luminance(');
		expect(shader).toContain('_packChar(charIdx)');
	});

	it('declares character mapping uniforms when charMap is used', () => {
		const shader = compileSynthSource(noise(8).charMap('@#%*+=-:. ')).fragmentSource;
		expect(shader).toContain('uniform int u_charMap[');
		expect(shader).toContain('uniform int u_charMapSize;');
	});

	it('creates a dynamic uniform for callback parameters with safe fallback', () => {
		const shader = compileSynthSource(noise(() => 6 + Math.sin(0) * 4)).fragmentSource;
		expect(shader).toContain('uniform float main_0_noise_scale;');

		const compiled = compileSynthSource(noise(() => 6 + Math.sin(0) * 4));
		expect(compiled.dynamicUpdaters.size).toBe(1);
	});

	it('creates dynamic uniforms for modulated arrays', () => {
		const arr = [0.5, 1, 2].fast(1);
		const compiled = compileSynthSource(noise(arr));
		expect(compiled.uniforms.size).toBe(1);
		expect([...compiled.uniforms.values()][0].isDynamic).toBe(true);
	});

	it('keeps solid(gray) scalar expansion in standalone and chained forms', () => {
		const standalone = solid(0.5);
		expect(standalone.transforms[0].name).toBe('solid');
		expect(standalone.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, 1]);

		const chained = osc().add(0.5);
		const nested = chained.nestedSources.get(1);
		expect(nested?.transforms[0].name).toBe('solid');
		expect(nested?.transforms[0].userArgs).toEqual([0.5, 0.5, 0.5, null]);
	});

	it('keeps the built-in global exposure surface intact', () => {
		if (typeof window === 'undefined') return;
		for (const name of [
			'osc',
			'noise',
			'plasma',
			'gradient',
			'moire',
			'voronoi',
			'shape',
			'solid',
			'src',
			'char',
			'charColor',
			'cellColor',
			'paint',
			'SynthPlugin',
			'SynthSource',
			'setGlobalErrorCallback',
		]) {
			expect((window as unknown as Record<string, unknown>)[name]).toBeDefined();
		}
	});
});
