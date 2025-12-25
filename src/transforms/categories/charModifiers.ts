/**
 * Character modifier transform definitions.
 * 
 * These transforms modify character properties like flipping,
 * rotation, and color inversion.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

export const charFlipX = defineTransform({
	name: 'charFlipX',
	type: 'charModify',
	inputs: [{ name: 'toggle', type: 'float', default: 1.0 }],
	glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,
	description: 'Flip characters horizontally',
});

export const charFlipY = defineTransform({
	name: 'charFlipY',
	type: 'charModify',
	inputs: [{ name: 'toggle', type: 'float', default: 1.0 }],
	glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,
	description: 'Flip characters vertically',
});

export const charInvert = defineTransform({
	name: 'charInvert',
	type: 'charModify',
	inputs: [{ name: 'toggle', type: 'float', default: 1.0 }],
	glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,
	description: 'Invert character colors',
});

export const charRotate = defineTransform({
	name: 'charRotate',
	type: 'charModify',
	inputs: [
		{ name: 'angle', type: 'float', default: 0.25 },
		{ name: 'speed', type: 'float', default: 0.0 },
	],
	glsl: `
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`,
	description: 'Rotate characters',
});

export const charRotateFrom = defineTransform({
	name: 'charRotateFrom',
	type: 'charModify',
	inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
	glsl: `
	float idx = _char.r * 255.0 + _char.g * 255.0 * 256.0;
	float rotation = fract(idx * amount * 0.01);
	return vec4(_char.rgb, rotation);
`,
	description: 'Derive rotation from character index',
});

/**
 * All character modifier transforms.
 */
export const CHAR_MODIFY_TRANSFORMS: TransformDefinition[] = [
	charFlipX,
	charFlipY,
	charInvert,
	charRotate,
	charRotateFrom,
];
