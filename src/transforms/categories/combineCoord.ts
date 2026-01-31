/**
 * Combine coordinate transform definitions (modulation).
 *
 * These transforms use one source to modulate the coordinates
 * of another, enabling effects like displacement and warping.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

function createModulateScrollTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'modulateScrollX' : 'modulateScrollY';
	const inputName = axis === 'x' ? 'scrollX' : 'scrollY';
	return defineTransform({
		name,
		type: 'combineCoord',
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
		type: 'combineCoord',
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
	type: 'combineCoord',
	inputs: [{ name: 'amount', type: 'float', default: 0.1 }],
	glsl: `
	return _st + _c0.xy * amount;
`,
	description: 'Modulate coordinates with another source',
});

export const modulateScale = defineTransform({
	name: 'modulateScale',
	type: 'combineCoord',
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
	type: 'combineCoord',
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
	type: 'combineCoord',
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
	type: 'combineCoord',
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
	type: 'combineCoord',
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
	type: 'combineCoord',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
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
