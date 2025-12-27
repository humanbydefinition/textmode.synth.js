/**
 * Compiler types and interfaces.
 */

import type { SynthUniform, SynthContext, CharacterMapping } from '../core/types';

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
	/** Whether this shader uses feedback (src/prev) - reads from prevBuffer */
	usesFeedback: boolean;
	/** Whether this shader uses character feedback (charSrc) - reads from prevCharBuffer */
	usesCharFeedback: boolean;
	/** Whether this shader uses cell color feedback (cellColorSrc) - reads from prevCellColorBuffer */
	usesCellColorFeedback: boolean;
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
