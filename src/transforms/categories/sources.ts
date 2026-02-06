/**
 * Source generator transforms.
 *
 * These transforms create base visual patterns from UV coordinates.
 * They are the starting point of most synth chains.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';
import { CHANNEL_SAMPLERS } from '../../core/constants';
import { TT_SRC } from '../../core/transform-types';

export const osc = defineTransform({
	name: 'osc',
	type: TT_SRC,
	inputs: [
		{ name: 'frequency', type: 'float', default: 60.0 },
		{ name: 'sync', type: 'float', default: 0.1 },
		{ name: 'offset', type: 'float', default: 0.0 },
	],
	glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`,
	description: 'Generate oscillating color pattern',
});

export const noise = defineTransform({
	name: 'noise',
	type: TT_SRC,
	inputs: [
		{ name: 'scale', type: 'float', default: 10.0 },
		{ name: 'offset', type: 'float', default: 0.1 },
	],
	glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`,
	description: 'Generate noise pattern',
});

export const plasma = defineTransform({
	name: 'plasma',
	type: TT_SRC,
	inputs: [
		{ name: 'scale', type: 'float', default: 10.0 },
		{ name: 'speed', type: 'float', default: 0.5 },
		{ name: 'phase', type: 'float', default: 0.0 },
		{ name: 'contrast', type: 'float', default: 1.0 },
	],
	glsl: `
	float t = time * speed + phase;
	float v = 0.0;
	v += sin((_st.x * scale) + t);
	v += sin((_st.y * scale * 1.1) + t * 1.2);
	v += sin(((_st.x + _st.y) * scale * 0.7) + t * 0.8);
	v = v / 3.0;
	v = v * 0.5 + 0.5;
	v = clamp((v - 0.5) * contrast + 0.5, 0.0, 1.0);
	return vec4(vec3(v), 1.0);
`,
	description: 'Generate plasma-like sine field',
});

export const moire = defineTransform({
	name: 'moire',
	type: TT_SRC,
	inputs: [
		{ name: 'freqA', type: 'float', default: 20.0 },
		{ name: 'freqB', type: 'float', default: 21.0 },
		{ name: 'angleA', type: 'float', default: 0.0 },
		{ name: 'angleB', type: 'float', default: 1.5708 },
		{ name: 'speed', type: 'float', default: 0.1 },
		{ name: 'phase', type: 'float', default: 0.0 },
	],
	glsl: `
	float t = time * speed + phase;
	vec2 p = _st - vec2(0.5);
	vec2 dirA = vec2(cos(angleA), sin(angleA));
	vec2 dirB = vec2(cos(angleB), sin(angleB));
	float a = sin(dot(p, dirA) * freqA + t);
	float b = sin(dot(p, dirB) * freqB - t * 0.7);
	float v = a * b;
	v = v * 0.5 + 0.5;
	return vec4(vec3(v), 1.0);
`,
	description: 'Generate moire interference patterns',
});

export const voronoi = defineTransform({
	name: 'voronoi',
	type: TT_SRC,
	inputs: [
		{ name: 'scale', type: 'float', default: 5.0 },
		{ name: 'speed', type: 'float', default: 0.3 },
		{ name: 'blending', type: 'float', default: 0.3 },
	],
	glsl: `
	vec3 color = vec3(0.0);
	vec2 st = _st * scale;
	vec2 i_st = floor(st);
	vec2 f_st = fract(st);
	float m_dist = 10.0;
	vec2 m_point;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 p = i_st + neighbor;
		// Apply seed offset to hash function for deterministic randomness
			// Use fract() to avoid precision issues with large seeds
			vec2 seedOffset = vec2(fract(_seed * 0.1271) * 1000.0, fract(_seed * 0.3117) * 1000.0);
			vec2 point = fract(sin(vec2(dot(p + seedOffset, vec2(127.1, 311.7)), dot(p + seedOffset, vec2(269.5, 183.3)))) * 43758.5453);
			point = 0.5 + 0.5 * sin(time * speed + 6.2831 * point);
			vec2 diff = neighbor + point - f_st;
			float dist = length(diff);
			if (dist < m_dist) {
				m_dist = dist;
				m_point = point;
			}
		}
	}
	color += dot(m_point, vec2(0.3, 0.6));
	color *= 1.0 - blending * m_dist;
	return vec4(color, 1.0);
`,
	description: 'Generate voronoi pattern',
});

export const gradient = defineTransform({
	name: 'gradient',
	type: TT_SRC,
	inputs: [{ name: 'speed', type: 'float', default: 0.0 }],
	glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`,
	description: 'Generate gradient pattern',
});

export const shape = defineTransform({
	name: 'shape',
	type: TT_SRC,
	inputs: [
		{ name: 'sides', type: 'float', default: 3.0 },
		{ name: 'radius', type: 'float', default: 0.3 },
		{ name: 'smoothing', type: 'float', default: 0.01 },
	],
	glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`,
	description: 'Generate polygon shape',
});

export const solid = defineTransform({
	name: 'solid',
	type: TT_SRC,
	inputs: [
		{ name: 'r', type: 'float', default: 0.0 },
		{ name: 'g', type: 'float', default: 0.0 },
		{ name: 'b', type: 'float', default: 0.0 },
		{ name: 'a', type: 'float', default: 1.0 },
	],
	glsl: `
	return vec4(r, g, b, a);
`,
	description: 'Generate solid color',
});

export const src = defineTransform({
	name: 'src',
	type: TT_SRC,
	inputs: [],
	glsl: `
	return texture(${CHANNEL_SAMPLERS.charColor}, fract(_st));
`,
	description:
		'Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context).',
});

export const srcTexture = defineTransform({
	name: 'srcTexture',
	type: TT_SRC,
	inputs: [],
	glsl: `
	// Placeholder - actual texture sampling is handled dynamically per TextmodeSource
	return texture(u_textmodeSource0, fract(_st));
`,
	description:
		'Sample from a TextmodeSource (image/video). Context-aware: the actual sampler uniform is determined at compile time based on the source reference.',
});

/**
 * All source generator transforms.
 */
export const SOURCE_TRANSFORMS: TransformDefinition[] = [
	osc,
	noise,
	plasma,
	moire,
	voronoi,
	gradient,
	shape,
	solid,
	src,
	srcTexture,
];
