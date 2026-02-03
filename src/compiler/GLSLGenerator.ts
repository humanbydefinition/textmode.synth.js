/**
 * GLSLGenerator - Generates GLSL shader code from compiled data.
 *
 * This module is responsible for assembling the final GLSL fragment
 * shader from collected functions, uniforms, and main code.
 */

import type { SynthUniform, CharacterMapping } from '../core/types';
import type { ExternalLayerInfo, TextmodeSourceInfo } from './types';
import { CHANNEL_SAMPLERS, CHANNEL_SUFFIXES } from '../core/constants';

/**
 * Options for shader generation.
 */
export interface ShaderGenerationOptions {
	/** Uniform declarations */
	uniforms: Map<string, SynthUniform>;
	/** GLSL function definitions */
	glslFunctions: Set<string>;
	/** Main function code lines */
	mainCode: string[];
	/** Character output code */
	charOutputCode: string;
	/** Primary color variable name */
	primaryColorVar: string;
	/** Cell color variable name */
	cellColorVar: string;
	/** Character mapping (if any) */
	charMapping?: CharacterMapping;
	/** Whether primary color feedback (src) is used */
	usesFeedback?: boolean;
	/** Whether character feedback (src) is used */
	usesCharFeedback?: boolean;
	/** Whether cell color feedback (src) is used */
	usesCellColorFeedback?: boolean;
	/** Whether char() function is used */
	usesCharSource?: boolean;
	/** External layer references used in this shader */
	externalLayers?: Map<string, ExternalLayerInfo>;
	/** TextmodeSource references used in this shader */
	textmodeSources?: Map<string, TextmodeSourceInfo>;
}

/**
 * GLSL utility functions included in all shaders.
 */
const UTILITY_FUNCTIONS = `
// Utility functions
float _luminance(vec3 rgb) {
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	return dot(rgb, W);
}

float _smoothThreshold(float value, float threshold, float tolerance) {
	return smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), value);
}

vec3 _rgbToHsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 _hsvToRgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x) {
	return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
	return 1.79284291400159 - 0.85373472095314 * r;
}

float _noise(vec3 v) {
	const vec2 C = vec2(1.0/6.0, 1.0/3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

	// First corner
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);

	vec3 x1 = x0 - i1 + 1.0 * C.xxx;
	vec3 x2 = x0 - i2 + 2.0 * C.xxx;
	vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

	// Permutations
	i = mod(i, 289.0);
	vec4 p = permute(permute(permute(
		i.z + vec4(0.0, i1.z, i2.z, 1.0))
		+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
		+ i.x + vec4(0.0, i1.x, i2.x, 1.0));

	// Gradients: N*N points uniformly over a square, mapped onto an octahedron.
	float n_ = 1.0/7.0;
	vec3 ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);

	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);

	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);

	// Normalize gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec4 _packChar(int charIdx) {
	return vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);
}

int _unpackChar(vec4 c) {
	return int(c.r * 255.0 + c.g * 255.0 * 256.0);
}
`;

/**
 * Generate the complete fragment shader.
 */
export function generateFragmentShader(options: ShaderGenerationOptions): string {
	const {
		uniforms,
		glslFunctions,
		mainCode,
		charOutputCode,
		primaryColorVar,
		cellColorVar,
		charMapping,
		usesFeedback,
		usesCharFeedback,
		usesCellColorFeedback,
		usesCharSource,
		externalLayers,
		textmodeSources,
	} = options;

	// Build uniform declarations
	const uniformDecls = Array.from(uniforms.values())
		.map((u) => `uniform ${u.type} ${u.name};`)
		.join('\n');

	// Character mapping declarations and code
	let charMapDecl = '';
	let charMapCode = '';
	if (charMapping) {
		charMapDecl = `uniform int u_charMap[${charMapping.indices.length}];\nuniform int u_charMapSize;`;
		charMapCode = `
	// Apply character mapping
	int rawCharIdx = _unpackChar(charOutput);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput = _packChar(mappedCharIdx);`;
	}

	// Feedback buffer declarations (self-feedback)
	const feedbackDecls: string[] = [];
	if (usesFeedback) {
		feedbackDecls.push(`uniform sampler2D ${CHANNEL_SAMPLERS.charColor};`);
	}
	if (usesCharFeedback) {
		feedbackDecls.push(`uniform sampler2D ${CHANNEL_SAMPLERS.char};`);
	}
	if (usesCellColorFeedback) {
		feedbackDecls.push(`uniform sampler2D ${CHANNEL_SAMPLERS.cellColor};`);
	}
	const feedbackDecl = feedbackDecls.join('\n');

	// Char source count uniform (for char() function)
	const charSourceDecl = usesCharSource ? 'uniform float u_charSourceCount;' : '';

	// External layer sampler declarations
	const externalLayerDecls: string[] = [];
	if (externalLayers) {
		for (const [, info] of externalLayers) {
			if (info.usesChar) {
				externalLayerDecls.push(
					`uniform sampler2D ${info.uniformPrefix}${CHANNEL_SUFFIXES.char};`
				);
			}
			if (info.usesCharColor) {
				externalLayerDecls.push(
					`uniform sampler2D ${info.uniformPrefix}${CHANNEL_SUFFIXES.charColor};`
				);
			}
			if (info.usesCellColor) {
				externalLayerDecls.push(
					`uniform sampler2D ${info.uniformPrefix}${CHANNEL_SUFFIXES.cellColor};`
				);
			}
		}
	}
	const externalLayerDecl =
		externalLayerDecls.length > 0
			? `// External layer samplers\n${externalLayerDecls.join('\n')}`
			: '';

	// TextmodeSource sampler declarations
	const textmodeSourceDecls: string[] = [];
	if (textmodeSources) {
		for (const [, info] of textmodeSources) {
			textmodeSourceDecls.push(`uniform sampler2D ${info.uniformName};`);
			textmodeSourceDecls.push(`uniform vec2 ${info.uniformName}_dim;`);
		}
	}
	const textmodeSourceDecl =
		textmodeSourceDecls.length > 0
			? `// TextmodeSource samplers (images/videos)\n${textmodeSourceDecls.join('\n')}`
			: '';

	return `#version 300 es
precision highp float;

// Varyings
in vec2 v_uv;

// MRT outputs
layout(location = 0) out vec4 o_character;
layout(location = 1) out vec4 o_primaryColor;
layout(location = 2) out vec4 o_secondaryColor;

// Standard uniforms
uniform float time;
uniform vec2 u_resolution;
${feedbackDecl}
${externalLayerDecl}
${textmodeSourceDecl}
${charMapDecl}
${charSourceDecl}

// Dynamic uniforms
${uniformDecls}

${UTILITY_FUNCTIONS}

// Transform functions
${Array.from(glslFunctions).join('\n')}

void main() {
	// Transform chain
${mainCode.join('\n')}

${charOutputCode}
${charMapCode}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${primaryColorVar};
	o_secondaryColor = ${cellColorVar};
}
`;
}

/**
 * Generate character output code based on chain result.
 */
export function generateCharacterOutputCode(
	hasCharVar: boolean,
	charVar: string,
	colorVar: string
): string {
	if (hasCharVar) {
		return `
	// Character output from generator
	vec4 charOutput = ${charVar};`;
	}

	// No character generator - derive from color luminance
	return `
	// Derive character from color luminance
	float lum = _luminance(${colorVar}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = _packChar(charIdx);`;
}
