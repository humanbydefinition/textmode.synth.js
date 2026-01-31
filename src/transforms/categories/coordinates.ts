/**
 * Coordinate transform definitions.
 *
 * These transforms modify UV coordinates before sampling,
 * enabling effects like rotation, scaling, scrolling, and tiling.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

function createScrollTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'scrollX' : 'scrollY';
	return defineTransform({
		name,
		type: 'coord',
		inputs: [
			{ name, type: 'float', default: 0.5 },
			{ name: 'speed', type: 'float', default: 0.0 },
		],
		glsl: `
	vec2 st = _st;
	st.${axis} += ${name} + time * speed;
	return fract(st);
`,
		description: `Scroll ${axis.toUpperCase()} coordinate`,
	});
}

function createRepeatTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'repeatX' : 'repeatY';
	const vecMult = axis === 'x' ? 'reps, 1.0' : '1.0, reps';
	const targetAxis = axis === 'x' ? 'y' : 'x';
	const sourceAxis = axis;

	return defineTransform({
		name,
		type: 'coord',
		inputs: [
			{ name: 'reps', type: 'float', default: 3.0 },
			{ name: 'offset', type: 'float', default: 0.0 },
		],
		glsl: `
	vec2 st = _st * vec2(${vecMult});
	st.${targetAxis} += step(1.0, mod(st.${sourceAxis}, 2.0)) * offset;
	return fract(st);
`,
		description: `Repeat pattern ${axis === 'x' ? 'horizontally' : 'vertically'}`,
	});
}

export const rotate = defineTransform({
	name: 'rotate',
	type: 'coord',
	inputs: [
		{ name: 'angle', type: 'float', default: 10.0 },
		{ name: 'speed', type: 'float', default: 0.0 },
	],
	glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`,
	description: 'Rotate coordinates',
});

export const scale = defineTransform({
	name: 'scale',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 1.5 },
		{ name: 'xMult', type: 'float', default: 1.0 },
		{ name: 'yMult', type: 'float', default: 1.0 },
		{ name: 'offsetX', type: 'float', default: 0.5 },
		{ name: 'offsetY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`,
	description: 'Scale coordinates',
});

export const scroll = defineTransform({
	name: 'scroll',
	type: 'coord',
	inputs: [
		{ name: 'scrollX', type: 'float', default: 0.5 },
		{ name: 'scrollY', type: 'float', default: 0.5 },
		{ name: 'speedX', type: 'float', default: 0.0 },
		{ name: 'speedY', type: 'float', default: 0.0 },
	],
	glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`,
	description: 'Scroll coordinates',
});

export const scrollX = createScrollTransform('x');

export const scrollY = createScrollTransform('y');

export const pixelate = defineTransform({
	name: 'pixelate',
	type: 'coord',
	inputs: [
		{ name: 'pixelX', type: 'float', default: 20.0 },
		{ name: 'pixelY', type: 'float', default: 20.0 },
	],
	glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`,
	description: 'Pixelate coordinates',
});

export const repeat = defineTransform({
	name: 'repeat',
	type: 'coord',
	inputs: [
		{ name: 'repeatX', type: 'float', default: 3.0 },
		{ name: 'repeatY', type: 'float', default: 3.0 },
		{ name: 'offsetX', type: 'float', default: 0.0 },
		{ name: 'offsetY', type: 'float', default: 0.0 },
	],
	glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`,
	description: 'Repeat pattern',
});

export const repeatX = createRepeatTransform('x');

export const repeatY = createRepeatTransform('y');

export const kaleid = defineTransform({
	name: 'kaleid',
	type: 'coord',
	inputs: [{ name: 'nSides', type: 'float', default: 4.0 }],
	glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`,
	description: 'Kaleidoscope effect',
});

/**
 * All coordinate transforms.
 */
export const COORD_TRANSFORMS: TransformDefinition[] = [
	rotate,
	scale,
	scroll,
	scrollX,
	scrollY,
	pixelate,
	repeat,
	repeatX,
	repeatY,
	kaleid,
];
