/**
 * Character and cell color transform definitions.
 * 
 * These transforms generate colors for character foregrounds
 * and cell backgrounds in textmode rendering.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

// ============================================================
// CHARACTER COLOR SOURCES (type: 'charColor')
// ============================================================

export const charColorSolid = defineTransform({
	name: 'charColorSolid',
	type: 'charColor',
	inputs: [
		{ name: 'r', type: 'float', default: 1.0 },
		{ name: 'g', type: 'float', default: 1.0 },
		{ name: 'b', type: 'float', default: 1.0 },
		{ name: 'a', type: 'float', default: 1.0 },
	],
	glsl: `
	return vec4(r, g, b, a);
`,
	description: 'Set solid character color',
});

export const charColorFromIndex = defineTransform({
	name: 'charColorFromIndex',
	type: 'charColor',
	inputs: [
		{ name: 'hueOffset', type: 'float', default: 0.0 },
		{ name: 'saturation', type: 'float', default: 1.0 },
		{ name: 'brightness', type: 'float', default: 1.0 },
	],
	glsl: `
	float idx = _char.r * 255.0 + _char.g * 255.0 * 256.0;
	float hue = fract(idx * 0.01 + hueOffset);
	vec3 rgb = _hsvToRgb(vec3(hue, saturation, brightness));
	return vec4(rgb, 1.0);
`,
	description: 'Derive character color from index',
});

export const charColorGradient = defineTransform({
	name: 'charColorGradient',
	type: 'charColor',
	inputs: [{ name: 'speed', type: 'float', default: 0.0 }],
	glsl: `
	return vec4(_st, sin(time * speed) * 0.5 + 0.5, 1.0);
`,
	description: 'Use gradient for character color',
});

// ============================================================
// CELL COLOR SOURCES (type: 'cellColor')
// ============================================================

export const cellColorSolid = defineTransform({
	name: 'cellColorSolid',
	type: 'cellColor',
	inputs: [
		{ name: 'r', type: 'float', default: 0.0 },
		{ name: 'g', type: 'float', default: 0.0 },
		{ name: 'b', type: 'float', default: 0.0 },
		{ name: 'a', type: 'float', default: 0.0 },
	],
	glsl: `
	return vec4(r, g, b, a);
`,
	description: 'Set solid cell color',
});

export const cellColorComplement = defineTransform({
	name: 'cellColorComplement',
	type: 'cellColor',
	inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
	glsl: `
	vec3 complement = 1.0 - _charColor.rgb;
	return vec4(complement * amount, _charColor.a);
`,
	description: 'Set cell color as complement of character color',
});

export const cellColorFromChar = defineTransform({
	name: 'cellColorFromChar',
	type: 'cellColor',
	inputs: [
		{ name: 'hueShift', type: 'float', default: 0.5 },
		{ name: 'saturation', type: 'float', default: 0.8 },
		{ name: 'brightness', type: 'float', default: 0.3 },
	],
	glsl: `
	float idx = _char.r * 255.0 + _char.g * 255.0 * 256.0;
	float hue = fract(idx * 0.01 + hueShift);
	vec3 rgb = _hsvToRgb(vec3(hue, saturation, brightness));
	return vec4(rgb, 1.0);
`,
	description: 'Derive cell color from character index',
});

/**
 * All character color transforms.
 */
export const CHAR_COLOR_TRANSFORMS: TransformDefinition[] = [
	charColorSolid,
	charColorFromIndex,
	charColorGradient,
];

/**
 * All cell color transforms.
 */
export const CELL_COLOR_TRANSFORMS: TransformDefinition[] = [
	cellColorSolid,
	cellColorComplement,
	cellColorFromChar,
];
