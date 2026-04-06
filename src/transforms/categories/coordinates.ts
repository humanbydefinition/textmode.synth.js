/**
 * Coordinate transform definitions.
 *
 * These transforms modify UV coordinates before sampling,
 * enabling effects like rotation, scaling, scrolling, and tiling.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';
import { TT_COORD } from '../../core/constants';
import type { SynthParameterValue } from '../../core/types';

function createScrollTransform(axis: 'x' | 'y'): TransformDefinition {
	const name = axis === 'x' ? 'scrollX' : 'scrollY';
	return defineTransform({
		name,
		type: TT_COORD,
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
		type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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
	type: TT_COORD,
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

// ── Type Declarations ──────────────────────────────────────────────────────────

declare module '../../core/SynthSource' {
	interface SynthSource {
		/**
		 * Rotate coordinates.
		 * @param angle - Rotation angle in radians (default: 10.0)
		 * @param speed - Rotation speed multiplier (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/rotate/sketch.js}
		 */
		rotate(angle?: SynthParameterValue, speed?: SynthParameterValue): this;

		/**
		 * Scale coordinates.
		 * @param amount - Scale amount (default: 1.5)
		 * @param xMult - X axis multiplier (default: 1.0)
		 * @param yMult - Y axis multiplier (default: 1.0)
		 * @param offsetX - X offset (default: 0.5)
		 * @param offsetY - Y offset (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/scale/sketch.js}
		 */
		scale(
			amount?: SynthParameterValue,
			xMult?: SynthParameterValue,
			yMult?: SynthParameterValue,
			offsetX?: SynthParameterValue,
			offsetY?: SynthParameterValue
		): this;

		/**
		 * Scroll coordinates in both X and Y directions.
		 * @param scrollX - X scroll amount (default: 0.5)
		 * @param scrollY - Y scroll amount (default: 0.5)
		 * @param speedX - X scroll speed (default: 0.0)
		 * @param speedY - Y scroll speed (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/scroll/sketch.js}
		 */
		scroll(
			scrollX?: SynthParameterValue,
			scrollY?: SynthParameterValue,
			speedX?: SynthParameterValue,
			speedY?: SynthParameterValue
		): this;

		/**
		 * Scroll coordinates in X direction.
		 * @param scrollX - X scroll amount (default: 0.5)
		 * @param speed - Scroll speed (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/scrollX/sketch.js}
		 */
		scrollX(scrollX?: SynthParameterValue, speed?: SynthParameterValue): this;

		/**
		 * Scroll coordinates in Y direction.
		 * @param scrollY - Y scroll amount (default: 0.5)
		 * @param speed - Scroll speed (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/scrollY/sketch.js}
		 */
		scrollY(scrollY?: SynthParameterValue, speed?: SynthParameterValue): this;

		/**
		 * Pixelate the output.
		 * @param pixelX - Pixel size in X (default: 20.0)
		 * @param pixelY - Pixel size in Y (default: 20.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/pixelate/sketch.js}
		 */
		pixelate(pixelX?: SynthParameterValue, pixelY?: SynthParameterValue): this;

		/**
		 * Repeat coordinates in both X and Y directions.
		 * @param repeatX - Number of X repetitions (default: 3.0)
		 * @param repeatY - Number of Y repetitions (default: 3.0)
		 * @param offsetX - X offset between repetitions (default: 0.0)
		 * @param offsetY - Y offset between repetitions (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/repeat/sketch.js}
		 */
		repeat(
			repeatX?: SynthParameterValue,
			repeatY?: SynthParameterValue,
			offsetX?: SynthParameterValue,
			offsetY?: SynthParameterValue
		): this;

		/**
		 * Repeat coordinates in X direction.
		 * @param reps - Number of repetitions (default: 3.0)
		 * @param offset - Offset between repetitions (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/repeatX/sketch.js}
		 */
		repeatX(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

		/**
		 * Repeat coordinates in Y direction.
		 * @param reps - Number of repetitions (default: 3.0)
		 * @param offset - Offset between repetitions (default: 0.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/repeatY/sketch.js}
		 */
		repeatY(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

		/**
		 * Apply kaleidoscope effect.
		 * @param nSides - Number of kaleidoscope sides (default: 4.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/kaleid/sketch.js}
		 */
		kaleid(nSides?: SynthParameterValue): this;

		/**
		 * Convert coordinates to polar space.
		 * @param angle - Angle offset in radians (default: 0.0)
		 * @param radius - Radius multiplier (default: 1.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/polar/sketch.js}
		 */
		polar(angle?: SynthParameterValue, radius?: SynthParameterValue): this;

		/**
		 * Twirl distortion with radial falloff.
		 * @param amount - Twirl strength (default: 2.0)
		 * @param radius - Effect radius (default: 0.5)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/twirl/sketch.js}
		 */
		twirl(
			amount?: SynthParameterValue,
			radius?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;

		/**
		 * Swirl distortion around a center.
		 * @param amount - Swirl strength (default: 4.0)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/swirl/sketch.js}
		 */
		swirl(
			amount?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;

		/**
		 * Mirror coordinates across X and/or Y axes.
		 * @param mirrorX - Mirror X (0-1, default: 1.0)
		 * @param mirrorY - Mirror Y (0-1, default: 1.0)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/mirror/sketch.js}
		 */
		mirror(mirrorX?: SynthParameterValue, mirrorY?: SynthParameterValue): this;

		/**
		 * Shear coordinates along X and Y axes.
		 * @param x - X shear amount (default: 0.0)
		 * @param y - Y shear amount (default: 0.0)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/shear/sketch.js}
		 */
		shear(
			x?: SynthParameterValue,
			y?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;

		/**
		 * Barrel distortion (bulge outward).
		 * @param amount - Distortion amount (default: 0.5)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/barrel/sketch.js}
		 */
		barrel(
			amount?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;

		/**
		 * Pinch distortion (pull inward).
		 * @param amount - Distortion amount (default: 0.5)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/pinch/sketch.js}
		 */
		pinch(
			amount?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;

		/**
		 * Fisheye lens distortion.
		 * @param amount - Distortion amount (default: 1.0)
		 * @param centerX - Center X (default: 0.5)
		 * @param centerY - Center Y (default: 0.5)
		 *
		 * @example
		 * {@includeCode ../../examples/Coordinates/fisheye/sketch.js}
		 */
		fisheye(
			amount?: SynthParameterValue,
			centerX?: SynthParameterValue,
			centerY?: SynthParameterValue
		): this;
	}
}
