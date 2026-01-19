/**
 * Compiler types and interfaces.
 */

import type { SynthUniform, SynthContext, CharacterMapping } from '../core/types';

/**
 * Compilation target context determining which texture `src()` samples from.
 *
 * - `char`: Compiling a character source chain → src() samples prevCharBuffer
 * - `charColor`: Compiling a character color chain → src() samples prevCharColorBuffer
 * - `cellColor`: Compiling a cell color chain → src() samples prevCellColorBuffer
 * - `main`: Compiling the main chain → src() samples prevCharColorBuffer
 */
export type CompilationTarget = 'char' | 'charColor' | 'cellColor' | 'main';

/**
 * Information about an external layer reference used in the shader.
 * Tracks which textures from the external layer are sampled.
 */
export interface ExternalLayerInfo {
	/** Unique identifier for this external layer in the shader */
	layerId: string;
	/** Uniform prefix for this layer's samplers (e.g., 'extLayer0') */
	uniformPrefix: string;
	/** Whether the character texture is sampled */
	usesChar: boolean;
	/** Whether the primary color texture is sampled */
	usesCharColor: boolean;
	/** Whether the cell color texture is sampled */
	usesCellColor: boolean;
}

/**
 * Result of compiling a SynthSource.
 */
export interface CompiledSynthShader {
	/** Complete fragment shader source */
	fragmentSource: string;
	/** Uniform definitions with their values/updaters */
	uniforms: Map<string, SynthUniform>;
	/** Dynamic uniform updaters keyed by uniform name */
	dynamicUpdaters: Map<string, (ctx: SynthContext) => number | number[]>;
	/** Character mapping if charMap was used */
	charMapping?: CharacterMapping;
	/** Whether this shader uses character color feedback (src) - reads from prevCharColorBuffer */
	usesCharColorFeedback: boolean;
	/** Whether this shader uses character feedback (src) - reads from prevCharBuffer */
	usesCharFeedback: boolean;
	/** Whether this shader uses cell color feedback (src) - reads from prevCellColorBuffer */
	usesCellColorFeedback: boolean;
	/** Whether this shader uses char() function for character indices */
	usesCharSource: boolean;
	/** External layer references used in this shader, keyed by layer ID */
	externalLayers: Map<string, ExternalLayerInfo>;
}

/**
 * Intermediate representation node for a transform.
 */
export interface IRNode {
	/** Transform name */
	name: string;
	/** Resolved argument strings (GLSL literals or uniform names) */
	args: string[];
	/** Transform type */
	type: string;
	/** Reference to nested source result (for combine operations) */
	nestedColorVar?: string;
}

/**
 * Result from compiling a chain.
 */
export interface ChainCompilationResult {
	/** Current coordinate variable name */
	coordVar: string;
	/** Current color variable name */
	colorVar: string;
	/** Character output variable (if any) */
	charVar?: string;
	/** Flags variable (if any) */
	flagsVar?: string;
	/** Rotation variable (if any) */
	rotationVar?: string;
}

/**
 * Context for code generation.
 */
export interface GenerationContext {
	/** Counter for unique variable names */
	varCounter: number;
	/** Accumulated GLSL function definitions */
	glslFunctions: Set<string>;
	/** Accumulated main code lines */
	mainCode: string[];
	/** Collected uniforms */
	uniforms: Map<string, SynthUniform>;
	/** Dynamic uniform updaters */
	dynamicUpdaters: Map<string, (ctx: SynthContext) => number | number[]>;
}
