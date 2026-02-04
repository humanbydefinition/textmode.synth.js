/**
 * Color transform definitions.
 *
 * These transforms modify color output values, enabling effects like
 * brightness, contrast, saturation, hue shifting, and color manipulation.
 */

import {
	defineTransform,
	type TransformDefinition,
	type TransformInput,
} from '../TransformDefinition';
import { TT_COLOR } from '../../core/transform-types';

const CHANNEL_INPUTS: TransformInput[] = [
	{ name: 'scale', type: 'float', default: 1.0 },
	{ name: 'offset', type: 'float', default: 0.0 },
];

function createChannelTransform(channel: 'r' | 'g' | 'b'): TransformDefinition {
	return defineTransform({
		name: channel,
		type: TT_COLOR,
		inputs: CHANNEL_INPUTS,
		glsl: `
	return vec4(_c0.${channel} * scale + offset);
`,
		description: `Extract ${channel === 'r' ? 'red' : channel === 'g' ? 'green' : 'blue'} channel`,
	});
}

export const brightness = defineTransform({
	name: 'brightness',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 0.4 }],
	glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`,
	description: 'Adjust brightness',
});

export const contrast = defineTransform({
	name: 'contrast',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 1.6 }],
	glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`,
	description: 'Adjust contrast',
});

export const invert = defineTransform({
	name: 'invert',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`,
	description: 'Invert colors',
});

export const saturate = defineTransform({
	name: 'saturate',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 2.0 }],
	glsl: `
	vec3 intensity = vec3(_luminance(_c0.rgb));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`,
	description: 'Adjust saturation',
});

export const hue = defineTransform({
	name: 'hue',
	type: TT_COLOR,
	inputs: [{ name: 'hue', type: 'float', default: 0.4 }],
	glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`,
	description: 'Shift hue',
});

export const colorama = defineTransform({
	name: 'colorama',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 0.005 }],
	glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`,
	description: 'Color cycle effect',
});

export const posterize = defineTransform({
	name: 'posterize',
	type: TT_COLOR,
	inputs: [
		{ name: 'bins', type: 'float', default: 3.0 },
		{ name: 'gamma', type: 'float', default: 0.6 },
	],
	glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`,
	description: 'Posterize colors',
});

export const luma = defineTransform({
	name: 'luma',
	type: TT_COLOR,
	inputs: [
		{ name: 'threshold', type: 'float', default: 0.5 },
		{ name: 'tolerance', type: 'float', default: 0.1 },
	],
	glsl: `
	float a = _smoothThreshold(_luminance(_c0.rgb), threshold, tolerance);
	return vec4(_c0.rgb * a, a);
`,
	description: 'Luma key',
});

export const thresh = defineTransform({
	name: 'thresh',
	type: TT_COLOR,
	inputs: [
		{ name: 'threshold', type: 'float', default: 0.5 },
		{ name: 'tolerance', type: 'float', default: 0.04 },
	],
	glsl: `
	return vec4(vec3(_smoothThreshold(_luminance(_c0.rgb), threshold, tolerance)), _c0.a);
`,
	description: 'Threshold',
});

export const color = defineTransform({
	name: 'color',
	type: TT_COLOR,
	inputs: [
		{ name: 'r', type: 'float', default: 1.0 },
		{ name: 'g', type: 'float', default: 1.0 },
		{ name: 'b', type: 'float', default: 1.0 },
		{ name: 'a', type: 'float', default: 1.0 },
	],
	glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`,
	description: 'Multiply by color',
});

export const r = createChannelTransform('r');

export const g = createChannelTransform('g');

export const b = createChannelTransform('b');

export const shift = defineTransform({
	name: 'shift',
	type: TT_COLOR,
	inputs: [
		{ name: 'r', type: 'float', default: 0.5 },
		{ name: 'g', type: 'float', default: 0.0 },
		{ name: 'b', type: 'float', default: 0.0 },
		{ name: 'a', type: 'float', default: 0.0 },
	],
	glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`,
	description: 'Shift color channels by adding offset values',
});

export const gamma = defineTransform({
	name: 'gamma',
	type: TT_COLOR,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`,
	description: 'Apply gamma correction',
});

export const levels = defineTransform({
	name: 'levels',
	type: TT_COLOR,
	inputs: [
		{ name: 'inMin', type: 'float', default: 0.0 },
		{ name: 'inMax', type: 'float', default: 1.0 },
		{ name: 'outMin', type: 'float', default: 0.0 },
		{ name: 'outMax', type: 'float', default: 1.0 },
		{ name: 'gamma', type: 'float', default: 1.0 },
	],
	glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`,
	description: 'Adjust input/output levels and gamma',
});

export const clamp = defineTransform({
	name: 'clamp',
	type: TT_COLOR,
	inputs: [
		{ name: 'min', type: 'float', default: 0.0 },
		{ name: 'max', type: 'float', default: 1.0 },
	],
	glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`,
	description: 'Clamp color values to a range',
});

/**
 * All color transforms.
 */
export const COLOR_TRANSFORMS: TransformDefinition[] = [
	brightness,
	contrast,
	invert,
	saturate,
	hue,
	colorama,
	posterize,
	luma,
	thresh,
	color,
	r,
	g,
	b,
	shift,
	gamma,
	levels,
	clamp,
];
