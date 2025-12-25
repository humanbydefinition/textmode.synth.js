/**
 * Character generator transform definitions.
 * 
 * These transforms generate character indices for the textmode grid,
 * enabling procedural text-based visuals.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

export const charNoise = defineTransform({
	name: 'charNoise',
	type: 'char',
	inputs: [
		{ name: 'scale', type: 'float', default: 10.0 },
		{ name: 'offset', type: 'float', default: 0.5 },
		{ name: 'charCount', type: 'float', default: 256.0 },
	],
	glsl: `
	float n = _noise(vec3(_st * scale, offset * time));
	n = n * 0.5 + 0.5;
	int charIndex = int(n * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Generate characters from noise',
});

export const charOsc = defineTransform({
	name: 'charOsc',
	type: 'char',
	inputs: [
		{ name: 'frequency', type: 'float', default: 8.0 },
		{ name: 'sync', type: 'float', default: 0.1 },
		{ name: 'offset', type: 'float', default: 0.0 },
		{ name: 'charCount', type: 'float', default: 256.0 },
	],
	glsl: `
	float wave = sin((_st.x - offset/frequency + time * sync) * frequency) * 0.5 + 0.5;
	int charIndex = int(wave * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Generate characters from oscillator',
});

export const charGradient = defineTransform({
	name: 'charGradient',
	type: 'char',
	inputs: [
		{ name: 'speed', type: 'float', default: 0.0 },
		{ name: 'charCount', type: 'float', default: 256.0 },
	],
	glsl: `
	float t = _st.x + sin(time * speed);
	int charIndex = int(fract(t) * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Generate characters from gradient',
});

export const charVoronoi = defineTransform({
	name: 'charVoronoi',
	type: 'char',
	inputs: [
		{ name: 'scale', type: 'float', default: 5.0 },
		{ name: 'speed', type: 'float', default: 0.3 },
		{ name: 'charCount', type: 'float', default: 256.0 },
	],
	glsl: `
	vec2 st = _st * scale;
	vec2 i_st = floor(st);
	vec2 f_st = fract(st);
	float m_dist = 10.0;
	vec2 m_point;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 p = i_st + neighbor;
			vec2 point = fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
			point = 0.5 + 0.5 * sin(time * speed + 6.2831 * point);
			vec2 diff = neighbor + point - f_st;
			float dist = length(diff);
			if (dist < m_dist) {
				m_dist = dist;
				m_point = point;
			}
		}
	}
	float value = dot(m_point, vec2(0.5, 0.5));
	int charIndex = int(value * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Generate characters from voronoi',
});

export const charShape = defineTransform({
	name: 'charShape',
	type: 'char',
	inputs: [
		{ name: 'sides', type: 'float', default: 4.0 },
		{ name: 'innerChar', type: 'float', default: 64.0 },
		{ name: 'outerChar', type: 'float', default: 32.0 },
		{ name: 'radius', type: 'float', default: 0.3 },
	],
	glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	int charIndex = d < radius ? int(innerChar) : int(outerChar);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Generate characters from shape',
});

export const charSolid = defineTransform({
	name: 'charSolid',
	type: 'char',
	inputs: [{ name: 'charIndex', type: 'float', default: 64.0 }],
	glsl: `
	int idx = int(charIndex);
	return vec4(float(idx % 256) / 255.0, float(idx / 256) / 255.0, 0.0, 0.0);
`,
	description: 'Set a solid character',
});

/**
 * All character generator transforms.
 */
export const CHAR_TRANSFORMS: TransformDefinition[] = [
	charNoise,
	charOsc,
	charGradient,
	charVoronoi,
	charShape,
	charSolid,
];
