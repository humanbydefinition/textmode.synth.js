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
 * Sample the previous frame's primary color output for feedback effects.
 * This is the core of feedback loops - it reads from the previous frame's
 * primary color texture (character foreground color), enabling effects like 
 * trails, motion blur, and recursive patterns.
 * 
 * Equivalent to hydra's `src(o0)`.
 * 
 * @example
 * ```typescript
 * // Classic feedback loop with noise modulation (hydra-style)
 * src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
 * 
 * // Feedback with color shift
 * src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
 * ```
 */
export const src = defineTransform({
	name: 'src',
	type: 'src',
	inputs: [],
	glsl: `
	return texture(prevBuffer, fract(_st));
`,
	description: 'Sample the previous frame primary color for feedback effects',
});

/**
 * Alias for src() - sample the previous frame's primary color output.
 * @deprecated Use src() instead for hydra compatibility
 */
export const prev = defineTransform({
	name: 'prev',
	type: 'src',
	inputs: [],
	glsl: `
	return texture(prevBuffer, fract(_st));
`,
	description: 'Sample the previous frame primary color for feedback effects (alias for src)',
});

/**
 * Sample the previous frame's character data for feedback effects.
 * Reads from the previous frame's character texture (attachment 0), which contains
 * character index and transform data.
 * 
 * Use this to create feedback loops that affect character selection.
 * 
 * @example
 * ```typescript
 * // Character feedback with modulation
 * charSrc().modulate(noise(3), 0.01)
 * ```
 */
export const charSrc = defineTransform({
	name: 'charSrc',
	type: 'src',
	inputs: [],
	glsl: `
	return texture(prevCharBuffer, fract(_st));
`,
	description: 'Sample the previous frame character data for feedback effects',
});

/**
 * Sample the previous frame's cell/secondary color for feedback effects.
 * Reads from the previous frame's secondary color texture (attachment 2), which contains
 * the cell background color.
 * 
 * Use this to create feedback loops that affect cell background colors.
 * 
 * @example
 * ```typescript
 * // Cell color feedback
 * cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
 * ```
 */
export const cellColorSrc = defineTransform({
	name: 'cellColorSrc',
	type: 'src',
	inputs: [],
	glsl: `
	return texture(prevCellColorBuffer, fract(_st));
`,
	description: 'Sample the previous frame cell color for feedback effects',
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
	src,
	prev,
	charSrc,
	cellColorSrc,
];
