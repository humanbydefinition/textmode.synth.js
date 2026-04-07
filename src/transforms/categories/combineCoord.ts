/**
 * Combine coordinate transform definitions (modulation).
 *
 * These transforms use one source to modulate the coordinates
 * of another, enabling effects like displacement and warping.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';
import { TT_COMBINE_COORD } from '../../core/constants';
import type { SynthParameterValue } from '../../core/types';

function createModulateScrollTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'modulateScrollX' : 'modulateScrollY';
	const inputName = axis === 'x' ? 'scrollX' : 'scrollY';
	return defineTransform({
		name,
		type: TT_COMBINE_COORD,
		inputs: [
			{ name: inputName, type: 'float', default: 0.5 },
			{ name: 'speed', type: 'float', default: 0.0 },
		],
		glsl: `
	vec2 st = _st;
	st.${axis} += _c0.r * ${inputName} + time * speed;
	return fract(st);
`,
		description: `Modulate ${axis.toUpperCase()} scroll with another source`,
	});
}

function createModulateRepeatTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'modulateRepeatX' : 'modulateRepeatY';
	const vecMult = axis === 'x' ? 'reps, 1.0' : '1.0, reps';
	const targetAxis = axis === 'x' ? 'y' : 'x';
	const sourceAxis = axis;

	return defineTransform({
		name,
		type: TT_COMBINE_COORD,
		inputs: [
			{ name: 'reps', type: 'float', default: 3.0 },
			{ name: 'offset', type: 'float', default: 0.5 },
		],
		glsl: `
	vec2 st = _st * vec2(${vecMult});
	st.${targetAxis} += step(1.0, mod(st.${sourceAxis}, 2.0)) + _c0.r * offset;
	return fract(st);
`,
		description: `Modulate ${axis.toUpperCase()} repeat with another source`,
	});
}

export const modulate = defineTransform({
	name: 'modulate',
	type: TT_COMBINE_COORD,
	inputs: [{ name: 'amount', type: 'float', default: 0.1 }],
	glsl: `
	return _st + _c0.xy * amount;
`,
	description: 'Modulate coordinates with another source',
});

export const modulateScale = defineTransform({
	name: 'modulateScale',
	type: TT_COMBINE_COORD,
	inputs: [
		{ name: 'multiple', type: 'float', default: 1.0 },
		{ name: 'offset', type: 'float', default: 1.0 },
	],
	glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`,
	description: 'Modulate scale with another source',
});

export const modulateRotate = defineTransform({
	name: 'modulateRotate',
	type: TT_COMBINE_COORD,
	inputs: [
		{ name: 'multiple', type: 'float', default: 1.0 },
		{ name: 'offset', type: 'float', default: 0.0 },
	],
	glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`,
	description: 'Modulate rotation with another source',
});

export const modulatePixelate = defineTransform({
	name: 'modulatePixelate',
	type: TT_COMBINE_COORD,
	inputs: [
		{ name: 'multiple', type: 'float', default: 10.0 },
		{ name: 'offset', type: 'float', default: 3.0 },
	],
	glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`,
	description: 'Modulate pixelation with another source',
});

export const modulateKaleid = defineTransform({
	name: 'modulateKaleid',
	type: TT_COMBINE_COORD,
	inputs: [{ name: 'nSides', type: 'float', default: 4.0 }],
	glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`,
	description: 'Modulate kaleidoscope with another source',
});

export const modulateScrollX = createModulateScrollTransform('x');

export const modulateScrollY = createModulateScrollTransform('y');

export const modulateRepeat = defineTransform({
	name: 'modulateRepeat',
	type: TT_COMBINE_COORD,
	inputs: [
		{ name: 'repeatX', type: 'float', default: 3.0 },
		{ name: 'repeatY', type: 'float', default: 3.0 },
		{ name: 'offsetX', type: 'float', default: 0.5 },
		{ name: 'offsetY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`,
	description: 'Modulate repeat pattern with another source',
});

export const modulateRepeatX = createModulateRepeatTransform('x');

export const modulateRepeatY = createModulateRepeatTransform('y');

export const modulateHue = defineTransform({
	name: 'modulateHue',
	type: TT_COMBINE_COORD,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / u_resolution);
`,
	description: 'Modulate coordinates based on hue differences',
});

/**
 * All combine coordinate transforms.
 */
export const COMBINE_COORD_TRANSFORMS: TransformDefinition[] = [
	modulate,
	modulateScale,
	modulateRotate,
	modulatePixelate,
	modulateKaleid,
	modulateScrollX,
	modulateScrollY,
	modulateRepeat,
	modulateRepeatX,
	modulateRepeatY,
	modulateHue,
];

// ── Type Declarations ──────────────────────────────────────────────────────────

declare module '../../core/SynthSource' {
	interface SynthSource {
		/**
		 * Modulate coordinates using another source.
		 * @param source - Modulation source
		 * @param amount - Modulation amount (default: 0.1)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulate/sketch.js}
		 */
		modulate(source: SynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

		/**
		 * Modulate scale using another source.
		 * @param source - Modulation source
		 * @param multiple - Scale multiplier (default: 1.0)
		 * @param offset - Offset amount (default: 1.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateScale/sketch.js}
		 */
		modulateScale(
			source: SynthSource | SynthParameterValue,
			multiple?: SynthParameterValue,
			offset?: SynthParameterValue
		): this;

		/**
		 * Modulate rotation using another source.
		 * @param source - Modulation source
		 * @param multiple - Rotation multiplier (default: 1.0)
		 * @param offset - Offset amount (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateRotate/sketch.js}
		 */
		modulateRotate(
			source: SynthSource | SynthParameterValue,
			multiple?: SynthParameterValue,
			offset?: SynthParameterValue
		): this;

		/**
		 * Modulate pixelation using another source.
		 * @param source - Modulation source
		 * @param multiple - Pixelation multiplier (default: 10.0)
		 * @param offset - Offset amount (default: 3.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulatePixelate/sketch.js}
		 */
		modulatePixelate(
			source: SynthSource | SynthParameterValue,
			multiple?: SynthParameterValue,
			offset?: SynthParameterValue
		): this;

		/**
		 * Modulate kaleidoscope using another source.
		 * @param source - Modulation source
		 * @param nSides - Number of sides (default: 4.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateKaleid/sketch.js}
		 */
		modulateKaleid(source: SynthSource | SynthParameterValue, nSides?: SynthParameterValue): this;

		/**
		 * Modulate X scroll using another source.
		 * @param source - Modulation source
		 * @param scrollX - X scroll amount (default: 0.5)
		 * @param speed - Scroll speed (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateScrollX/sketch.js}
		 */
		modulateScrollX(
			source: SynthSource | SynthParameterValue,
			scrollX?: SynthParameterValue,
			speed?: SynthParameterValue
		): this;

		/**
		 * Modulate Y scroll using another source.
		 * @param source - Modulation source
		 * @param scrollY - Y scroll amount (default: 0.5)
		 * @param speed - Scroll speed (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateScrollY/sketch.js}
		 */
		modulateScrollY(
			source: SynthSource | SynthParameterValue,
			scrollY?: SynthParameterValue,
			speed?: SynthParameterValue
		): this;

		/**
		 * Modulate repeat pattern with another source.
		 * @param source - Modulation source
		 * @param repeatX - X repetitions (default: 3.0)
		 * @param repeatY - Y repetitions (default: 3.0)
		 * @param offsetX - X offset (default: 0.5)
		 * @param offsetY - Y offset (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateRepeat/sketch.js}
		 */
		modulateRepeat(
			source: SynthSource | SynthParameterValue,
			repeatX?: SynthParameterValue,
			repeatY?: SynthParameterValue,
			offsetX?: SynthParameterValue,
			offsetY?: SynthParameterValue
		): this;

		/**
		 * Modulate X repeat with another source.
		 * @param source - Modulation source
		 * @param reps - Number of repetitions (default: 3.0)
		 * @param offset - Offset amount (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateRepeatX/sketch.js}
		 */
		modulateRepeatX(
			source: SynthSource | SynthParameterValue,
			reps?: SynthParameterValue,
			offset?: SynthParameterValue
		): this;

		/**
		 * Modulate Y repeat with another source.
		 * @param source - Modulation source
		 * @param reps - Number of repetitions (default: 3.0)
		 * @param offset - Offset amount (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateRepeatY/sketch.js}
		 */
		modulateRepeatY(
			source: SynthSource | SynthParameterValue,
			reps?: SynthParameterValue,
			offset?: SynthParameterValue
		): this;

		/**
		 * Modulate coordinates based on hue differences.
		 * @param source - Modulation source
		 * @param amount - Modulation amount (default: 1.0)
		 *
		 * @example
		 * {@includeCode ../../../examples/SynthSource/modulateHue/sketch.js}
		 */
		modulateHue(source: SynthSource | SynthParameterValue, amount?: SynthParameterValue): this;
	}
}
