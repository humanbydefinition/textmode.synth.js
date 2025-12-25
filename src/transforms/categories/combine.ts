/**
 * Combine transform definitions.
 * 
 * These transforms blend two sources together using various
 * blending modes like add, multiply, blend, difference, and layer.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

export const add = defineTransform({
	name: 'add',
	type: 'combine',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`,
	description: 'Add another source',
});

export const sub = defineTransform({
	name: 'sub',
	type: 'combine',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`,
	description: 'Subtract another source',
});

export const mult = defineTransform({
	name: 'mult',
	type: 'combine',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`,
	description: 'Multiply with another source',
});

export const blend = defineTransform({
	name: 'blend',
	type: 'combine',
	inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
	glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`,
	description: 'Blend with another source',
});

export const diff = defineTransform({
	name: 'diff',
	type: 'combine',
	inputs: [],
	glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`,
	description: 'Difference with another source',
});

export const layer = defineTransform({
	name: 'layer',
	type: 'combine',
	inputs: [],
	glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`,
	description: 'Layer another source on top',
});

export const mask = defineTransform({
	name: 'mask',
	type: 'combine',
	inputs: [],
	glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`,
	description: 'Mask with another source',
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
];
