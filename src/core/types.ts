/**
 * Core types for the textmode.js synthesis system.
 * 
 * This module contains foundational type definitions used throughout
 * the synth engine, including transform types, parameter values,
 * context interfaces, and shader compilation types.
 */

import { SynthSource } from "./SynthSource";



/**
 * Transform type categories determining how functions compose in the shader pipeline.
 * 
 * Each type has specific input/output signatures:
 * - `src`: Source generators that produce colors from UV coordinates
 * - `coord`: Coordinate transforms that modify UV before sampling
 * - `color`: Color transforms that modify existing color values
 * - `combine`: Blending operations that combine two color sources
 * - `combineCoord`: Modulation that uses one source to affect another's coordinates
 * - `charModify`: Character property modifiers (flip, rotate, invert)
 */
export type SynthTransformType =
	| 'src'
	| 'coord'
	| 'color'
	| 'combine'
	| 'combineCoord'
	| 'char'
	| 'charModify'
	| 'charColor'
	| 'cellColor';

/**
 * GLSL type for transform inputs.
 */
export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'sampler2D';

/**
 * Input parameter definition for a transform function.
 */
export interface TransformInput {
	/** Parameter name used in GLSL and JS API */
	name: string;
	/** GLSL type */
	type: GLSLType;
	/** Default value if not provided */
	default: number | number[] | null;
}

/**
 * Dynamic parameter value types supported by the synth system.
 * 
 * - `number`: Static numeric value
 * - `number[]`: Array of numbers for vector types or modulated arrays (Hydra-style)
 * - `string`: String value (rarely used)
 * - `function`: Evaluated each frame with context
 * - `SynthSource`: Nested synth chain for combine/modulate operations
 * - `null`: Use default value
 */
export type SynthParameterValue =
	| number
	| number[]
	| string
	| ((ctx: SynthContext) => number)
	| ((ctx: SynthContext) => number[])
	| SynthSource
	| null;

/**
 * Context passed to dynamic parameter functions during rendering.
 */
export interface SynthContext {
	/** Current time in seconds */
	time: number;
	/** Current frame count */
	frameCount: number;
	/** Canvas/grid width in pixels */
	width: number;
	/** Canvas/grid height in pixels */
	height: number;
	/** Grid columns */
	cols: number;
	/** Grid rows */
	rows: number;
	/** Normalized mouse X (0-1) */
	mouseX: number;
	/** Normalized mouse Y (0-1) */
	mouseY: number;
}

/**
 * Character set mapping for charMap transform.
 */
export interface CharacterMapping {
	/** The character string to use */
	chars: string;
	/** Pre-computed character code points */
	indices: number[];
}

/**
 * Uniform definition for compiled shaders.
 */
export interface SynthUniform {
	/** Uniform name in GLSL */
	name: string;
	/** GLSL type */
	type: GLSLType;
	/** Current value */
	value: number | number[];
	/** Whether this uniform is dynamically updated each frame */
	isDynamic: boolean;
}

/**
 * Return type signature lookup for each transform type.
 */
export const TRANSFORM_TYPE_INFO: Record<
	SynthTransformType,
	{
		returnType: string;
		args: Array<{ type: string; name: string }>;
	}
> = {
	src: {
		returnType: 'vec4',
		args: [{ type: 'vec2', name: '_st' }],
	},
	coord: {
		returnType: 'vec2',
		args: [{ type: 'vec2', name: '_st' }],
	},
	color: {
		returnType: 'vec4',
		args: [{ type: 'vec4', name: '_c0' }],
	},
	combine: {
		returnType: 'vec4',
		args: [
			{ type: 'vec4', name: '_c0' },
			{ type: 'vec4', name: '_c1' },
		],
	},
	combineCoord: {
		returnType: 'vec2',
		args: [
			{ type: 'vec2', name: '_st' },
			{ type: 'vec4', name: '_c0' },
		],
	},
	char: {
		returnType: 'vec4',
		args: [{ type: 'vec2', name: '_st' }],
	},
	charModify: {
		returnType: 'vec4',
		args: [{ type: 'vec4', name: '_char' }],
	},
	charColor: {
		returnType: 'vec4',
		args: [
			{ type: 'vec2', name: '_st' },
			{ type: 'vec4', name: '_char' },
		],
	},
	cellColor: {
		returnType: 'vec4',
		args: [
			{ type: 'vec2', name: '_st' },
			{ type: 'vec4', name: '_char' },
			{ type: 'vec4', name: '_charColor' },
		],
	},
};

/**
 * Create a CharacterMapping from a string of characters.
 */
export function createCharacterMapping(chars: string): CharacterMapping {
	const charArray = Array.from(chars);
	const indices: number[] = [];

	for (const char of charArray) {
		indices.push(char.codePointAt(0) ?? 32);
	}

	return { chars, indices };
}
