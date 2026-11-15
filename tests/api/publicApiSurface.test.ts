import { describe, it, expect, expectTypeOf } from 'vitest';
import * as synth from '../../src/index';
import type { SynthTransformType } from '../../src/index';

describe('public API surface', () => {
	it('exports the expected runtime values and no removed extensibility helpers', () => {
		const exported = Object.keys(synth);
		const expected = [
			'SynthPlugin',
			'SynthSource',
			'cellColor',
			'char',
			'charColor',
			'gradient',
			'moire',
			'noise',
			'osc',
			'paint',
			'plasma',
			'shape',
			'solid',
			'src',
			'voronoi',
			'EASING_FUNCTIONS',
			'setGlobalErrorCallback',
			'setFunction',
		];
		for (const name of expected) {
			expect(exported).toContain(name);
		}
		expect(exported).not.toContain('extendTransforms');
		expect(exported).not.toContain('defineSource');
	});

	it('exposes a single canonical transform type alias', () => {
		expectTypeOf<SynthTransformType>().toEqualTypeOf<'src' | 'coord' | 'color' | 'combine' | 'combineCoord'>();
	});
});
