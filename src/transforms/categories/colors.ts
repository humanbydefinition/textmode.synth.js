/**
 * Color transform definitions.
 * 
 * These transforms modify color output values, enabling effects like
 * brightness, contrast, saturation, hue shifting, and color manipulation.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

export const brightness = defineTransform({
	name: 'brightness',
	type: 'color',
	inputs: [{ name: 'amount', type: 'float', default: 0.4 }],
	glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`,
	description: 'Adjust brightness',
});

export const contrast = defineTransform({
	name: 'contrast',
	type: 'color',
	inputs: [{ name: 'amount', type: 'float', default: 1.6 }],
	glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`,
	description: 'Adjust contrast',
});

export const invert = defineTransform({
	name: 'invert',
	type: 'color',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`,
	description: 'Invert colors',
});

export const saturate = defineTransform({
	name: 'saturate',
	type: 'color',
	inputs: [{ name: 'amount', type: 'float', default: 2.0 }],
	glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`,
	description: 'Adjust saturation',
});

export const hue = defineTransform({
	name: 'hue',
	type: 'color',
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
	type: 'color',
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
	type: 'color',
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
	type: 'color',
	inputs: [
		{ name: 'threshold', type: 'float', default: 0.5 },
		{ name: 'tolerance', type: 'float', default: 0.1 },
	],
	glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`,
	description: 'Luma key',
});

export const thresh = defineTransform({
	name: 'thresh',
	type: 'color',
	inputs: [
		{ name: 'threshold', type: 'float', default: 0.5 },
		{ name: 'tolerance', type: 'float', default: 0.04 },
	],
	glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`,
	description: 'Threshold',
});

export const color = defineTransform({
	name: 'color',
	type: 'color',
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

export const r = defineTransform({
	name: 'r',
	type: 'color',
	inputs: [
		{ name: 'scale', type: 'float', default: 1.0 },
		{ name: 'offset', type: 'float', default: 0.0 },
	],
	glsl: `
	return vec4(_c0.r * scale + offset);
`,
	description: 'Extract red channel',
});

export const g = defineTransform({
	name: 'g',
	type: 'color',
	inputs: [
		{ name: 'scale', type: 'float', default: 1.0 },
		{ name: 'offset', type: 'float', default: 0.0 },
	],
	glsl: `
	return vec4(_c0.g * scale + offset);
`,
	description: 'Extract green channel',
});

export const b = defineTransform({
	name: 'b',
	type: 'color',
	inputs: [
		{ name: 'scale', type: 'float', default: 1.0 },
		{ name: 'offset', type: 'float', default: 0.0 },
	],
	glsl: `
	return vec4(_c0.b * scale + offset);
`,
	description: 'Extract blue channel',
});

export const shift = defineTransform({
	name: 'shift',
	type: 'color',
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
];
