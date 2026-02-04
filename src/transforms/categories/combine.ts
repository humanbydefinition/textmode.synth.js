/**
 * Combine transform definitions.
 *
 * These transforms blend two sources together using various
 * blending modes like add, multiply, blend, difference, and layer.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';
import { TT_COMBINE } from '../../core/transform-types';

export const add = defineTransform({
	name: 'add',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`,
	description: 'Add another source',
});

export const sub = defineTransform({
	name: 'sub',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`,
	description: 'Subtract another source',
});

export const mult = defineTransform({
	name: 'mult',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`,
	description: 'Multiply with another source',
});

export const blend = defineTransform({
	name: 'blend',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
	glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`,
	description: 'Blend with another source',
});

export const diff = defineTransform({
	name: 'diff',
	type: TT_COMBINE,
	inputs: [],
	glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`,
	description: 'Difference with another source',
});

export const layer = defineTransform({
	name: 'layer',
	type: TT_COMBINE,
	inputs: [],
	glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`,
	description: 'Layer another source on top',
});

export const mask = defineTransform({
	name: 'mask',
	type: TT_COMBINE,
	inputs: [],
	glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`,
	description: 'Mask with another source',
});

export const screen = defineTransform({
	name: 'screen',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = 1.0 - (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Screen blend with another source',
});

export const overlay = defineTransform({
	name: 'overlay',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 mult = 2.0 * _c0.rgb * _c1.rgb;
	vec3 screen = 1.0 - 2.0 * (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
	vec3 result = mix(mult, screen, step(0.5, _c0.rgb));
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Overlay blend with another source',
});

export const softlight = defineTransform({
	name: 'softlight',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = (1.0 - 2.0 * _c1.rgb) * _c0.rgb * _c0.rgb + 2.0 * _c1.rgb * _c0.rgb;
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Soft light blend with another source',
});

export const hardlight = defineTransform({
	name: 'hardlight',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 mult = 2.0 * _c0.rgb * _c1.rgb;
	vec3 screen = 1.0 - 2.0 * (1.0 - _c0.rgb) * (1.0 - _c1.rgb);
	vec3 result = mix(mult, screen, step(0.5, _c1.rgb));
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Hard light blend with another source',
});

export const dodge = defineTransform({
	name: 'dodge',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = _c0.rgb / max(vec3(0.00001), 1.0 - _c1.rgb);
	result = clamp(result, 0.0, 1.0);
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Color dodge blend with another source',
});

export const burn = defineTransform({
	name: 'burn',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = 1.0 - (1.0 - _c0.rgb) / max(vec3(0.00001), _c1.rgb);
	result = clamp(result, 0.0, 1.0);
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Color burn blend with another source',
});

export const lighten = defineTransform({
	name: 'lighten',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = max(_c0.rgb, _c1.rgb);
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Lighten blend with another source',
});

export const darken = defineTransform({
	name: 'darken',
	type: TT_COMBINE,
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	vec3 result = min(_c0.rgb, _c1.rgb);
	vec3 outRgb = mix(_c0.rgb, result, amount);
	float outA = mix(_c0.a, _c1.a, amount);
	return vec4(outRgb, outA);
`,
	description: 'Darken blend with another source',
});

/**
 * All combine transforms.
 */
export const COMBINE_TRANSFORMS: TransformDefinition[] = [
	add,
	sub,
	mult,
	blend,
	diff,
	layer,
	mask,
	screen,
	overlay,
	softlight,
	hardlight,
	dodge,
	burn,
	lighten,
	darken,
];
