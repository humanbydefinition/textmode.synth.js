/**
 * Source generator transforms.
 * 
 * These transforms create base visual patterns from UV coordinates.
 * They are the starting point of most synth chains.
 */

import { defineTransform, type TransformDefinition } from '../TransformDefinition';

export const osc = defineTransform({
	name: 'osc',
	type: 'src',
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
	type: 'src',
	inputs: [
		{ name: 'scale', type: 'float', default: 10.0 },
		{ name: 'offset', type: 'float', default: 0.1 },
	],
	glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`,
	description: 'Generate noise pattern',
});

export const voronoi = defineTransform({
	name: 'voronoi',
	type: 'src',
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
	color += dot(m_point, vec2(0.3, 0.6));
	color *= 1.0 - blending * m_dist;
	return vec4(color, 1.0);
`,
	description: 'Generate voronoi pattern',
});

export const gradient = defineTransform({
	name: 'gradient',
	type: 'src',
	inputs: [{ name: 'speed', type: 'float', default: 0.0 }],
	glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`,
	description: 'Generate gradient pattern',
});

export const shape = defineTransform({
	name: 'shape',
	type: 'src',
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
	type: 'src',
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

/**
 * All source generator transforms.
 */
export const SOURCE_TRANSFORMS: TransformDefinition[] = [
	osc,
	noise,
	voronoi,
	gradient,
	shape,
	solid,
];
