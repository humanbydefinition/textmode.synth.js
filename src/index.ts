/**
 * A `hydra`-inspired chainable visual synthesis system for `textmode.js`.
 * Enables procedural generation of characters, colors, and visual effects
 * through method chaining.
 *
 * @example
 * ```ts
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, charNoise, osc, solid } from 'textmode.synth.js';
 *
 * // Create textmode instance with SynthPlugin
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   fontSize: 16,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Create a synth chain with procedural characters and colors
 * const synth = charNoise(10)
 *   .charMap('@#%*+=-:. ')
 *   .charRotate(0.1)
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(solid(0, 0, 0, 0.5))
 *   .scroll(0.1, 0);
 *
 * // Apply synth to the base layer
 * t.layers.base.synth(synth);
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
import type { SynthContext, /* TransformInput */ } from './core/types';
// import type { TransformRecord as CoreTransformRecord } from './core/SynthChain';
import { initArrayUtils } from './lib/ArrayUtils';

// Initialize array utilities (adds .fast(), .smooth(), .ease() to Array.prototype)
initArrayUtils();

// Register all built-in transforms
TransformRegistry.registerMany(ALL_TRANSFORMS);

// Set up the SynthSource class for method injection
TransformFactory.setSynthSourceClass(SynthSource as unknown as new () => {
	addTransform(name: string, userArgs: unknown[]): unknown;
	addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
});

// Inject chainable methods into SynthSource prototype
TransformFactory.injectMethods(SynthSource.prototype as unknown as {
	addTransform(name: string, userArgs: unknown[]): unknown;
	addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
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
} from './core/types';

// ============================================================
// EXPORTS - Core classes
// ============================================================

export { SynthSource } from './core/SynthSource';

// ============================================================
// EXPORTS - Generated standalone functions
// These allow starting chains without explicit SynthSource creation
// ============================================================

// Source generators
/**
 * Generate oscillating patterns using sine waves.
 * @param frequency - Frequency of the oscillation (default: 60.0)
 * @param sync - Synchronization offset (default: 0.1)
 * @param offset - Phase offset (default: 0.0)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Basic oscillating color pattern
 * t.layers.base.synth(
 *   charOsc(10, 0.1)
 *     .charColor(osc(10, 0.1))
 * );
 * 
 * // Animated frequency using array modulation
 * t.layers.base.synth(
 *   charOsc([1, 10, 50, 100].fast(2), 0.001)
 *     .charColor(osc([1, 10, 50, 100].fast(2), 0.001))
 * );
 * ```
 */
export const osc = generatedFunctions['osc'] as (
	frequency?: number | number[] | ((ctx: SynthContext) => number),
	sync?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate Perlin noise patterns.
 * @param scale - Scale of the noise pattern (default: 10.0)
 * @param offset - Offset in noise space (default: 0.1)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Basic noise pattern
 * t.layers.base.synth(
 *   charNoise(10, 0.1)
 *     .charColor(noise(10, 0.1))
 * );
 * ```
 */
export const noise = generatedFunctions['noise'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate Voronoi (cellular) patterns.
 * @param scale - Scale of Voronoi cells (default: 5.0)
 * @param speed - Animation speed (default: 0.3)
 * @param blending - Blending between cell regions (default: 0.3)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Animated Voronoi pattern
 * t.layers.base.synth(
 *   charVoronoi(5, 0.3, 8)
 *     .charColor(voronoi(5, 0.3, 0.3))
 * );
 * ```
 */
export const voronoi = generatedFunctions['voronoi'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	speed?: number | number[] | ((ctx: SynthContext) => number),
	blending?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate a rotating radial gradient.
 * @param speed - Rotation speed (default: 0.0)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Animated gradient with array modulation
 * t.layers.base.synth(
 *   charGradient([1, 2, 4], 16)
 *     .charColor(gradient([1, 2, 4]))
 *     .cellColor(
 *       gradient([1, 2, 4])
 *         .invert((ctx) => Math.sin(ctx.time) * 2)
 *     )
 * );
 * ```
 */
export const gradient = generatedFunctions['gradient'] as (
	speed?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate geometric shapes (polygons).
 * @param sides - Number of sides (default: 3)
 * @param radius - Radius of the shape (default: 0.3)
 * @param smoothing - Edge smoothing amount (default: 0.01)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Triangle with smooth edges
 * t.layers.base.synth(
 *   charShape(3, 0, 1, 0.5)
 *     .charMap('. ')
 * );
 * 
 * // High-sided polygon (circle-like)
 * t.layers.base.synth(
 *   charShape(100, 0, 1, 0.5)
 *     .charMap('. ')
 * );
 * ```
 */
export const shape = generatedFunctions['shape'] as (
	sides?: number | number[] | ((ctx: SynthContext) => number),
	radius?: number | number[] | ((ctx: SynthContext) => number),
	smoothing?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate a solid color.
 * @param r - Red channel (0-1, default: 0.0)
 * @param g - Green channel (0-1, default: 0.0)
 * @param b - Blue channel (0-1, default: 0.0)
 * @param a - Alpha channel (0-1, default: 1.0)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Solid colors with array modulation
 * t.layers.base.synth(
 *   charSolid([16, 17, 18])
 *     .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
 *     .cellColor(
 *       solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
 *         .invert()
 *     )
 * );
 * ```
 */
export const solid = generatedFunctions['solid'] as (
	r?: number | number[] | ((ctx: SynthContext) => number),
	g?: number | number[] | ((ctx: SynthContext) => number),
	b?: number | number[] | ((ctx: SynthContext) => number),
	a?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

// Character sources
/**
 * Generate character indices using Perlin noise.
 * @param scale - Scale of the noise pattern (default: 10.0)
 * @param offset - Offset in noise space (default: 0.1)
 * @param charCount - Number of different characters to use (default: 256)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Noise-based character generation
 * t.layers.base.synth(
 *   charNoise(10, 0.1)
 *     .charColor(noise(10, 0.1))
 * );
 * ```
 */
export const charNoise = generatedFunctions['charNoise'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate character indices using oscillating sine waves.
 * @param frequency - Frequency of the oscillation (default: 60.0)
 * @param sync - Synchronization offset (default: 0.1)
 * @param offset - Phase offset (default: 0.0)
 * @param charCount - Number of different characters to use (default: 256)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Oscillating characters with dynamic frequency
 * t.layers.base.synth(
 *   charOsc([1, 10, 50, 100, 250, 500].fast(2), 0.001)
 *     .charColor(osc([1, 10, 50, 100, 250, 500].fast(2), 0.001))
 * );
 * 
 * // Using context function for time-based animation
 * t.layers.base.synth(
 *   charOsc(0.1, 0.1)
 *     .charColor(
 *       osc(10, 0.1, (ctx) => Math.sin(ctx.time / 10) * 100)
 *     )
 * );
 * ```
 */
export const charOsc = generatedFunctions['charOsc'] as (
	frequency?: number | number[] | ((ctx: SynthContext) => number),
	sync?: number | number[] | ((ctx: SynthContext) => number),
	offset?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate character indices using a rotating radial gradient.
 * @param speed - Rotation speed (default: 0.0)
 * @param charCount - Number of different characters to use (default: 256)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Gradient-based characters with array modulation
 * t.layers.base.synth(
 *   charGradient([1, 2, 4], 16)
 *     .charColor(gradient([1, 2, 4]))
 *     .cellColor(
 *       gradient([1, 2, 4])
 *         .invert((ctx) => Math.sin(ctx.time) * 2)
 *     )
 * );
 * ```
 */
export const charGradient = generatedFunctions['charGradient'] as (
	speed?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate character indices using Voronoi (cellular) patterns.
 * @param scale - Scale of Voronoi cells (default: 5.0)
 * @param speed - Animation speed (default: 0.3)
 * @param charCount - Number of different characters to use (default: 256)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Voronoi-based character generation
 * t.layers.base.synth(
 *   charVoronoi(5, 0.3, 8)
 *     .charColor(voronoi(5, 0.3, 0.3))
 * );
 * ```
 */
export const charVoronoi = generatedFunctions['charVoronoi'] as (
	scale?: number | number[] | ((ctx: SynthContext) => number),
	speed?: number | number[] | ((ctx: SynthContext) => number),
	charCount?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate character indices based on geometric shapes (polygons).
 * @param sides - Number of sides (default: 3)
 * @param innerChar - Character index for inside the shape (default: 0)
 * @param outerChar - Character index for outside the shape (default: 1)
 * @param radius - Radius of the shape (default: 0.3)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Triangle shape with two character indices
 * t.layers.base.synth(
 *   charShape(3, 0, 1, 0.5)
 *     .charMap('. ')
 * );
 * 
 * // Circle-like shape (100 sides)
 * t.layers.base.synth(
 *   charShape(100, 0, 1, 0.5)
 *     .charMap('. ')
 * );
 * ```
 */
export const charShape = generatedFunctions['charShape'] as (
	sides?: number | number[] | ((ctx: SynthContext) => number),
	innerChar?: number | number[] | ((ctx: SynthContext) => number),
	outerChar?: number | number[] | ((ctx: SynthContext) => number),
	radius?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

/**
 * Generate a solid character index across the entire canvas.
 * @param charIndex - Character index to use (default: 0)
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Solid character with array modulation for cycling
 * t.layers.base.synth(
 *   charSolid([16, 17, 18])
 *     .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
 *     .cellColor(
 *       solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
 *         .invert()
 *     )
 * );
 * ```
 */
export const charSolid = generatedFunctions['charSolid'] as (
	charIndex?: number | number[] | ((ctx: SynthContext) => number)
) => SynthSource;

// ============================================================
// EXPORTS - Utilities
// ============================================================

export type { ModulatedArray, EasingFunction } from './lib/ArrayUtils';

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