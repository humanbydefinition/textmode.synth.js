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

export const polar = defineTransform({
	name: 'polar',
	type: 'coord',
	inputs: [
		{ name: 'angle', type: 'float', default: 0.0 },
		{ name: 'radius', type: 'float', default: 1.0 },
	],
	glsl: `
	vec2 st = _st - vec2(0.5);
	float r = length(st) * radius;
	float a = atan(st.y, st.x) + angle;
	a = a / (2.0 * 3.1416);
	return vec2(fract(a), r);
`,
	description: 'Convert to polar coordinates',
});

export const twirl = defineTransform({
	name: 'twirl',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 2.0 },
		{ name: 'radius', type: 'float', default: 0.5 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	float safeRadius = max(radius, 0.00001);
	float t = clamp((safeRadius - r) / safeRadius, 0.0, 1.0);
	float angle = amount * t * t;
	float s = sin(angle);
	float c = cos(angle);
	p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
	return p + center;
`,
	description: 'Twirl distortion with radial falloff',
});

export const swirl = defineTransform({
	name: 'swirl',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 4.0 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	float angle = amount * r;
	float s = sin(angle);
	float c = cos(angle);
	p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
	return p + center;
`,
	description: 'Swirl distortion around a center',
});

export const mirror = defineTransform({
	name: 'mirror',
	type: 'coord',
	inputs: [
		{ name: 'mirrorX', type: 'float', default: 1.0 },
		{ name: 'mirrorY', type: 'float', default: 1.0 },
	],
	glsl: `
	vec2 m = abs(fract(_st * 2.0) - 1.0);
	vec2 mixAmt = clamp(vec2(mirrorX, mirrorY), 0.0, 1.0);
	return mix(_st, m, mixAmt);
`,
	description: 'Mirror coordinates across X and/or Y axes',
});

export const shear = defineTransform({
	name: 'shear',
	type: 'coord',
	inputs: [
		{ name: 'x', type: 'float', default: 0.0 },
		{ name: 'y', type: 'float', default: 0.0 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	p = vec2(p.x + y * p.y, p.y + x * p.x);
	return p + center;
`,
	description: 'Shear coordinates along X and Y',
});

export const barrel = defineTransform({
	name: 'barrel',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 0.5 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r2 = dot(p, p);
	p *= 1.0 + amount * r2;
	return p + center;
`,
	description: 'Barrel distortion (bulge outward)',
});

export const pinch = defineTransform({
	name: 'pinch',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 0.5 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r2 = dot(p, p);
	p *= 1.0 / (1.0 + amount * r2);
	return p + center;
`,
	description: 'Pinch distortion (pull inward)',
});

export const fisheye = defineTransform({
	name: 'fisheye',
	type: 'coord',
	inputs: [
		{ name: 'amount', type: 'float', default: 1.0 },
		{ name: 'centerX', type: 'float', default: 0.5 },
		{ name: 'centerY', type: 'float', default: 0.5 },
	],
	glsl: `
	vec2 center = vec2(centerX, centerY);
	vec2 p = _st - center;
	float r = length(p);
	if (r > 0.0) {
		float k = max(amount, 0.00001);
		float r2 = atan(r * k) / atan(k);
		p = p / r * r2;
	}
	return p + center;
`,
	description: 'Fisheye lens distortion',
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
	polar,
	twirl,
	swirl,
	mirror,
	shear,
	barrel,
	pinch,
	fisheye,
];
