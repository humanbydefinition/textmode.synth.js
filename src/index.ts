/**
 * Textmode Synth Module
 *
 * A hydra-inspired chainable visual synthesis system for textmode.js.
 * Enables procedural generation of characters, colors, and visual effects
 * through method chaining.
 *
 * @example
 * ```ts
 * import { charNoise, osc, solid } from 'textmode.js';
 *
 * // Create a synth chain with procedural characters and colors
 * const synth = charNoise(10)
 *   .charMap('@#%*+=-:. ')
 *   .charRotate(0.1)
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(solid(0, 0, 0, 0.5))
 *   .scroll(0.1, 0);
 *
 * // Apply to a layer
 * t.layers.add('synth', { synth });
 * ```
 *
 * @packageDocumentation
 */

// ============================================================
// INITIALIZATION
// Register all transforms and inject methods into SynthSource
// ============================================================

import { TransformRegistry } from './transforms/TransformRegistry';
import { TransformFactory } from './transforms/TransformFactory';
import { ALL_TRANSFORMS } from './transforms/categories';
import { SynthSource } from './core/SynthSource';
import type { SynthContext, TransformInput as CoreTransformInput } from './core/types';
import type { TransformRecord as CoreTransformRecord } from './core/SynthChain';
import { initArrayUtils } from './lib/ArrayUtils';

// Initialize array utilities (adds .fast(), .smooth(), .ease() to Array.prototype)
initArrayUtils();

// Register all built-in transforms
TransformRegistry.registerMany(ALL_TRANSFORMS);

// Set up the SynthSource class for method injection
TransformFactory.setSynthSourceClass(SynthSource as unknown as new () => { 
	_addTransform(name: string, userArgs: unknown[]): unknown;
	_addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
});

// Inject chainable methods into SynthSource prototype
TransformFactory.injectMethods(SynthSource.prototype as unknown as {
	_addTransform(name: string, userArgs: unknown[]): unknown;
	_addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
});

// Generate standalone functions for source transforms
const generatedFunctions = TransformFactory.generateStandaloneFunctions();

// ============================================================
// EXPORTS - Core types
// ============================================================

export { SynthPlugin } from './SynthPlugin';

export type {
	SynthTransformType,
	SynthParameterValue,
	SynthContext,
	SynthUniform,
	CharacterMapping,
	SynthSourceOptions,
	ISynthSource,
	GLSLType,
	TransformInput,
} from './core/types';

export { TRANSFORM_TYPE_INFO, createCharacterMapping } from './core/types';

// ============================================================
// EXPORTS - Core classes
// ============================================================

export { SynthSource } from './core/SynthSource';
export { SynthChain, type TransformRecord } from './core/SynthChain';

// ============================================================
// EXPORTS - Transforms
// ============================================================

export type { TransformDefinition, ProcessedTransform } from './transforms/TransformDefinition';
export { defineTransform, processTransform, getDefaultArgs, requiresNestedSource, isSourceType } from './transforms/TransformDefinition';
export { TransformRegistry } from './transforms/TransformRegistry';
export { TransformFactory, type GeneratedFunctions, type SynthSourcePrototype } from './transforms/TransformFactory';

// Re-export all transform definitions
export {
	ALL_TRANSFORMS,
	SOURCE_TRANSFORMS,
	COORD_TRANSFORMS,
	COLOR_TRANSFORMS,
	COMBINE_TRANSFORMS,
	COMBINE_COORD_TRANSFORMS,
	CHAR_TRANSFORMS,
	CHAR_MODIFY_TRANSFORMS,
	CHAR_COLOR_TRANSFORMS,
	CELL_COLOR_TRANSFORMS,
} from './transforms/categories';

// ============================================================
// EXPORTS - Compiler
// ============================================================

export type { CompiledSynthShader, IRNode, ChainCompilationResult, GenerationContext } from './compiler/types';
export { compileSynthSource, SYNTH_VERTEX_SHADER } from './compiler/SynthCompiler';
export { UniformManager, formatNumber } from './compiler/UniformManager';
export { generateFragmentShader, generateCharacterOutputCode } from './compiler/GLSLGenerator';

// ============================================================
// EXPORTS - Renderer
// ============================================================

export { SynthRenderer } from './renderer/SynthRenderer';
export { CharacterResolver } from './renderer/CharacterResolver';

// ============================================================
// EXPORTS - Generated standalone functions
// These allow starting chains without explicit SynthSource creation
// ============================================================

// Source generators
export const osc = generatedFunctions['osc'] as (
	frequency?: number | number[] | ((ctx: SynthContext) => number),
	sync?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const noise = generatedFunctions['noise'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const voronoi = generatedFunctions['voronoi'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	speed?: number | number[] | ((ctx: SynthContext) => number),
	blending?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const gradient = generatedFunctions['gradient'] as (
	speed?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const shape = generatedFunctions['shape'] as (
	sides?: number | number[] | ((ctx: SynthContext) => number),
	radius?: number | number[] | ((ctx: SynthContext) => number),
	smoothing?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const solid = generatedFunctions['solid'] as (
	r?: number | number[] | ((ctx: SynthContext) => number),
	g?: number | number[] | ((ctx: SynthContext) => number),
	b?: number | number[] | ((ctx: SynthContext) => number),
	a?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

// Character sources
export const charNoise = generatedFunctions['charNoise'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const charOsc = generatedFunctions['charOsc'] as (
	frequency?: number | number[] | ((ctx: SynthContext) => number),
	sync?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const charGradient = generatedFunctions['charGradient'] as (
	speed?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const charVoronoi = generatedFunctions['charVoronoi'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	speed?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const charShape = generatedFunctions['charShape'] as (
	sides?: number | number[] | ((ctx: SynthContext) => number),
	innerChar?: number | number[] | ((ctx: SynthContext) => number),
	outerChar?: number | number[] | ((ctx: SynthContext) => number),
	radius?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

export const charSolid = generatedFunctions['charSolid'] as (
	charIndex?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

// ============================================================
// EXPORTS - Utilities
// ============================================================

export type { ModulatedArray, EasingFunction } from './lib/ArrayUtils';
export { getArrayValue, isModulatedArray } from './lib/ArrayUtils';

// ============================================================
// TYPE AUGMENTATION
// Extend TextmodeLayer interface when this package is imported
// ============================================================

declare module 'textmode.js' {
    interface TextmodeLayer {
        /**
         * Set a synth source for this layer.
         * 
         * The synth will render procedurally generated characters and colors
         * directly to the layer's MRT framebuffer before the draw callback runs.
         * 
         * @param source A SynthSource chain defining the procedural generation
         */
        synth(source: SynthSource): void;

        /**
         * Clear the synth source from this layer.
         */
        clearSynth(): void;

        /**
         * Check if this layer has a synth source.
         */
        hasSynth(): boolean;
    }
}