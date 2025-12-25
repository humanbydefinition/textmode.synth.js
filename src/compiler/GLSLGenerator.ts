/**
 * GLSLGenerator - Generates GLSL shader code from compiled data.
 * 
 * This module is responsible for assembling the final GLSL fragment
 * shader from collected functions, uniforms, and main code.
 */

import type { SynthUniform, CharacterMapping } from '../core/types';

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
}

/**
 * GLSL utility functions included in all shaders.
 */
const UTILITY_FUNCTIONS = `
// Utility functions
float _luminance(vec3 rgb) {
	return dot(rgb, vec3(0.2126, 0.7152, 0.0722));
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

float _noise(vec3 p) {
	vec3 i = floor(p);
	vec3 f = fract(p);
	f = f * f * (3.0 - 2.0 * f);
	vec2 uv = (i.xy + vec2(37.0, 17.0) * i.z) + f.xy;
	vec2 rg = vec2(
		fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453),
		fract(sin(dot(uv + vec2(1.0, 0.0), vec2(12.9898, 78.233))) * 43758.5453)
	);
	return mix(rg.x, rg.y, f.z) * 2.0 - 1.0;
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
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`;
	}

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
uniform vec2 resolution;
${charMapDecl}

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
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}

/**
 * Vertex shader source for synth rendering.
 */
export const SYNTH_VERTEX_SHADER = `#version 300 es
precision highp float;

// Use explicit layout location for cross-platform compatibility
layout(location = 0) in vec2 a_position;

out vec2 v_uv;

void main() {
	vec2 uv = a_position * 0.5 + 0.5;
	v_uv = vec2(uv.x, 1.0 - uv.y);
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
