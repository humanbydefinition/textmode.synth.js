/**
 * A `hydra`-inspired chainable visual synthesis system for `textmode.js`.
 * Enables procedural generation of characters, colors, and visual effects
 * through method chaining.
 *
 * @example
 * ```ts
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, osc, noise } from 'textmode.synth.js';
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
 * const synth = noise(10)
 *   .rotate(0.1)
 *   .scroll(0.1, 0)
 *
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(osc(5).kaleid(4).invert())
 *
 *   .charMap('@#%*+=-:. ');
 *
 *
 * // Apply synth to the base layer
 * t.layers.base.synth(synth);
 * ```
 *
 * @packageDocumentation
 */
import { SynthSource } from './core/SynthSource';
import type { SynthContext } from './core/types';
/**
 * Create a character source from any color/pattern source.
 *
 * This function converts any pattern (like `osc()`, `noise()`, `voronoi()`) into
 * character indices. The pattern's luminance or color values are mapped to character indices.
 *
 * This is the recommended way to define character generation in textmode.synth.js,
 * as it provides a unified, compositional API where the same patterns can drive
 * characters, character colors, and cell colors.
 *
 * @param source - A SynthSource producing color values that will be mapped to characters
 * @param charCount - Number of different characters to use (default: 256)
 * @returns A new SynthSource configured for character generation
 *
 * @example
 * ```typescript
 * // Simple usage - same pattern for chars and colors
 * const pattern = osc(1, 0.1);
 * layer.synth(
 *   char(pattern)
 *     .charColor(pattern.clone())
 * );
 *
 * // With limited character count
 * layer.synth(
 *   char(noise(10), 16)
 *     .charMap('@#%*+=-:. ')
 * );
 * ```
 */
export declare const char: (source: SynthSource, charCount?: number) => SynthSource;
/**
 * Create a synth source with character foreground color defined.
 *
 * This function creates a SynthSource where the character foreground color
 * is driven by the provided source pattern. This is compositional and can be
 * combined with `char()` and `cellColor()`.
 *
 * @param source - A SynthSource producing color values for character foreground
 * @returns A new SynthSource configured with character color
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Start with character color
 * const pattern = osc(10, 0.1);
 * t.layers.base.synth(
 *   charColor(pattern)
 *     .char(noise(10))
 *     .cellColor(solid(0, 0, 0, 0.5))
 * );
 *
 * // Using different patterns for each aspect
 * t.layers.base.synth(
 *   charColor(voronoi(5).mult(osc(20)))
 *     .char(noise(10), 16)
 *     .charMap('@#%*+=-:. ')
 * );
 * ```
 */
export declare const charColor: (source: SynthSource) => SynthSource;
/**
 * Create a synth source with cell background color defined.
 *
 * This function creates a SynthSource where the cell background color
 * is driven by the provided source pattern. This is compositional and can be
 * combined with `char()` and `charColor()`.
 *
 * @param source - A SynthSource producing color values for cell background
 * @returns A new SynthSource configured with cell color
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Start with cell color
 * t.layers.base.synth(
 *   cellColor(solid(0, 0, 0, 0.5))
 *     .char(noise(10))
 *     .charColor(osc(5))
 * );
 *
 * // Complete composition - all three defined
 * const colorPattern = voronoi(5, 0.3);
 * t.layers.base.synth(
 *   cellColor(colorPattern.clone().invert())
 *     .char(noise(10), 16)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(colorPattern)
 * );
 * ```
 */
export declare const cellColor: (source: SynthSource) => SynthSource;
/**
 * Create a synth source with both character and cell colors defined.
 *
 * This function creates a SynthSource where both the character foreground color
 * and the cell background color are driven by the same source pattern.
 * This is a convenience function equivalent to calling both `charColor()` and
 * `cellColor()` with the same source.
 *
 * @param source - A SynthSource producing color values for both character and cell colors
 * @returns A new SynthSource configured with both color sources
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Use same pattern for both foreground and background colors
 * const colorPattern = osc(10, 0.1).mult(voronoi(5));
 * t.layers.base.synth(
 *   paint(colorPattern)
 *     .char(noise(10), 16)
 *     .charMap('@#%*+=-:. ')
 * );
 *
 * // Paint with gradient
 * t.layers.base.synth(
 *   paint(gradient(0.5))
 * );
 * ```
 */
export declare const paint: (source: SynthSource) => SynthSource;
export { SynthPlugin } from './SynthPlugin';
export type { SynthTransformType, SynthParameterValue, SynthContext, } from './core/types';
export { SynthSource } from './core/SynthSource';
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
 *   osc(1, 0.1)
 *     .charColor(osc(10, 0.1))
 * );
 *
 * // Animated frequency using array modulation
 * t.layers.base.synth(
 *   osc([1, 10, 50, 100].fast(2), 0.001)
 *     .charColor(osc([1, 10, 50, 100].fast(2), 0.001))
 * );
 * ```
 */
export declare const osc: (frequency?: number | number[] | ((ctx: SynthContext) => number), sync?: number | number[] | ((ctx: SynthContext) => number), offset?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
 *   noise(10, 0.1)
 *     .charColor(noise(10, 0.1))
 * );
 * ```
 */
export declare const noise: (scale?: number | number[] | ((ctx: SynthContext) => number), offset?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
 *   voronoi(5, 0.3, 0.3)
 *     .charColor(voronoi(5, 0.3, 0.3))
 * );
 * ```
 */
export declare const voronoi: (scale?: number | number[] | ((ctx: SynthContext) => number), speed?: number | number[] | ((ctx: SynthContext) => number), blending?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
 *   gradient([1, 2, 4])
 *     .charColor(gradient([1, 2, 4]))
 *     .cellColor(
 *       gradient([1, 2, 4])
 *         .invert((ctx) => Math.sin(ctx.time) * 2)
 *     )
 * );
 * ```
 */
export declare const gradient: (speed?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
 * // Triangle
 * t.layers.base.synth(
 *   shape(3)
 *     .charMap('. ')
 * );
 *
 * // High-sided polygon (circle-like)
 * t.layers.base.synth(
 *   shape(100)
 *     .charMap('. ')
 * );
 * ```
 */
export declare const shape: (sides?: number | number[] | ((ctx: SynthContext) => number), radius?: number | number[] | ((ctx: SynthContext) => number), smoothing?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
 *   solid(0.6, 0, 0, 1)
 *     .charColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1))
 *     .cellColor(
 *       solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)
 *         .invert()
 *     )
 * );
 * ```
 */
export declare const solid: (r?: number | number[] | ((ctx: SynthContext) => number), g?: number | number[] | ((ctx: SynthContext) => number), b?: number | number[] | ((ctx: SynthContext) => number), a?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
/**
 * Sample the previous frame's primary color output for feedback effects.
 * This is the core of feedback loops - it reads from the previous frame's
 * character foreground color, enabling effects like trails, motion blur,
 * and recursive patterns.
 *
 * Equivalent to hydra's `src(o0)`.
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Classic hydra-style feedback loop with noise modulation
 * t.layers.base.synth(
 *   src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
 * );
 *
 * // Feedback with color shift and scaling
 * t.layers.base.synth(
 *   src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
 * );
 * ```
 */
export declare const src: () => SynthSource;
/**
 * Sample the previous frame's character data for feedback effects.
 * Reads from the previous frame's character texture, which contains
 * character index and transform data.
 *
 * Use this to create feedback loops that affect character selection.
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Character feedback with modulation
 * t.layers.base.synth(
 *   charSrc().modulate(noise(3), 0.01)
 * );
 * ```
 */
export declare const charSrc: () => SynthSource;
/**
 * Sample the previous frame's cell/secondary color for feedback effects.
 * Reads from the previous frame's secondary color texture, which contains
 * the cell background color.
 *
 * Use this to create feedback loops that affect cell background colors.
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Cell color feedback
 * t.layers.base.synth(
 *   cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
 * );
 * ```
 */
export declare const cellColorSrc: () => SynthSource;
export type { ModulatedArray, EasingFunction } from './lib/ArrayUtils';
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
    }
}
//# sourceMappingURL=index.d.ts.map