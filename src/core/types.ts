/**
 * Core types for the textmode.js synthesis system.
 *
 * This module contains foundational type definitions used throughout
 * the synth engine, including transform types, parameter values,
 * context interfaces, and shader compilation types.
 */

import type { TextmodeFramebuffer, TextmodeShader } from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from './SynthSource';
import type { CompiledSynthShader } from '../compiler/types';
import type { CharacterResolver } from '../utils/CharacterResolver';

/**
 * Transform type categories determining how functions compose in the shader pipeline.
 *
 * Each type has specific input/output signatures:
 * - `src`: Source generators that produce colors from UV coordinates
 * - `coord`: Coordinate transforms that modify UV before sampling
 * - `color`: Color transforms that modify existing color values
 * - `combine`: Blending operations that combine two color sources
 * - `combineCoord`: Modulation that uses one source to affect another's coordinates
 */
export type SynthTransformType = 'src' | 'coord' | 'color' | 'combine' | 'combineCoord';

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
 * - `number[]`: Array of numbers for vector types or modulated arrays (hydra-like)
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
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * t.layers.base.synth(
 *   noise((ctx) => Math.sin(ctx.time) * 10)
 * );
 * ```
 */
export interface SynthContext {
	/** Current time in seconds */
	time: number;
	/** Current frame count */
	frameCount: number;
	/** Grid width in pixels */
	width: number;
	/** Grid height in pixels */
	height: number;
	/** Grid columns */
	cols: number;
	/** Grid rows */
	rows: number;
	/** Current BPM (beats per minute) for array modulation timing */
	bpm: number;
	/** Optional callback for handling dynamic parameter evaluation errors */
	onError?: (error: unknown, uniformName: string) => void;
}

/**
 * Per-layer synth state stored via plugin state API.
 */
export interface LayerSynthState {
	/** The original SynthSource */
	source: SynthSource;
	/** Compiled shader data */
	compiled?: CompiledSynthShader;
	/** The compiled GLShader instance */
	shader?: TextmodeShader;
	/** Character resolver for this layer's synth */
	characterResolver: CharacterResolver;
	/** Whether the shader needs to be recompiled */
	needsCompile: boolean;
	/**
	 * Ping-pong framebuffers for feedback loops.
	 * pingPongBuffers[0] = buffer A, pingPongBuffers[1] = buffer B
	 */
	pingPongBuffers?: [TextmodeFramebuffer, TextmodeFramebuffer];
	/**
	 * Current ping-pong index.
	 * READ from pingPongBuffers[pingPongIndex], WRITE to pingPongBuffers[1 - pingPongIndex].
	 */
	pingPongIndex: number;
	/**
	 * External layer references mapped to their layer objects.
	 * Populated during compilation from the source's external layer refs.
	 */
	externalLayerMap?: Map<string, TextmodeLayer>;
	/**
	 * Layer-specific BPM override.
	 * If set, this overrides the global BPM for this layer's array modulation.
	 */
	bpm?: number;
	/**
	 * Optional callback invoked when dynamic parameter evaluation fails.
	 * Live coding environments can use this to display errors without crashing.
	 *
	 * @param error - The error that was caught
	 * @param uniformName - Name of the uniform whose evaluation failed
	 */
	onDynamicError?: (error: unknown, uniformName: string) => void;
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
 * Reference to an external layer for cross-layer sampling.
 * Used by src(layer) to enable hydra-style output references.
 */
export interface ExternalLayerReference {
	/** Unique identifier for the layer (typically layer.id or generated) */
	layerId: string;
	/** The layer object reference (opaque to the compiler, used by plugin) */
	layer: unknown;
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
};
