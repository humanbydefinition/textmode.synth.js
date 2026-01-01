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
import { SynthSource } from './core/SynthSource';
import type { SynthContext } from './core/types';
import type { SynthOutput } from './core/SynthOutput';
export { SynthPlugin } from './SynthPlugin';
export type { SynthTransformType, SynthParameterValue, SynthContext, } from './core/types';
export { SynthOutput, createOutput, isSynthOutput, SELF_OUTPUT } from './core/SynthOutput';
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
 *   charNoise(10, 0.1)
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
 *   charVoronoi(5, 0.3, 8)
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
 *   charGradient([1, 2, 4], 16)
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
 *   charSolid([16, 17, 18])
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
 * When called without arguments, samples from the current layer's previous frame
 * (equivalent to hydra's `src(o0)`).
 *
 * When called with a SynthOutput from another layer, samples from that layer's
 * output (equivalent to hydra's `src(o1)`, `src(o2)`, etc.).
 *
 * @param output Optional - another layer's output reference. If omitted, uses self-feedback.
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, src, osc, noise, createOutput } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * // Self-feedback (like src(o0) in hydra)
 * t.layers.base.synth(
 *   src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
 * );
 *
 * // Cross-layer feedback (like src(o1) in hydra)
 * const layer0 = t.layers.add();
 * const layer1 = t.layers.add();
 * const o0 = createOutput(layer0);
 * const o1 = createOutput(layer1);
 *
 * layer0.synth(src(o1).hue(0.01).blend(osc(10), 0.1));
 * layer1.synth(noise(3).layer(src(o0).luma()));
 * ```
 */
export declare const src: (output?: SynthOutput) => SynthSource;
/**
 * Sample the previous frame's primary color output for feedback effects.
 * @deprecated Use src() instead for hydra compatibility
 *
 * @example
 * ```typescript
 * // Classic feedback loop with noise modulation
 * prev().modulate(noise(3), 0.005).blend(shape(4), 0.01)
 *
 * // Character trails effect
 * prev().scale(1.01).blend(charNoise(10).charColor(osc(5)), 0.1)
 * ```
 */
export declare const prev: () => SynthSource;
/**
 * Sample the previous frame's character data for feedback effects.
 * Reads from the previous frame's character texture, which contains
 * character index and transform data.
 *
 * When called without arguments, samples from the current layer's previous frame.
 * When called with a SynthOutput from another layer, samples from that layer's
 * character texture.
 *
 * Use this to create feedback loops that affect character selection.
 *
 * @param output Optional - another layer's output reference. If omitted, uses self-feedback.
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
export declare const charSrc: (output?: SynthOutput) => SynthSource;
/**
 * Sample the previous frame's cell/secondary color for feedback effects.
 * Reads from the previous frame's secondary color texture, which contains
 * the cell background color.
 *
 * When called without arguments, samples from the current layer's previous frame.
 * When called with a SynthOutput from another layer, samples from that layer's
 * cell color texture.
 *
 * Use this to create feedback loops that affect cell background colors.
 *
 * @param output Optional - another layer's output reference. If omitted, uses self-feedback.
 *
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Cell color feedback (self-reference)
 * t.layers.base.synth(
 *   cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
 * );
 *
 * // Cross-layer cell color reference
 * const o1 = createOutput(layer1);
 * layer0.synth(cellColorSrc(o1).blend(osc(10), 0.2));
 * ```
 */
export declare const cellColorSrc: (output?: SynthOutput) => SynthSource;
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
export declare const charNoise: (scale?: number | number[] | ((ctx: SynthContext) => number), offset?: number | number[] | ((ctx: SynthContext) => number), charCount?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
export declare const charOsc: (frequency?: number | number[] | ((ctx: SynthContext) => number), sync?: number | number[] | ((ctx: SynthContext) => number), offset?: number | number[] | ((ctx: SynthContext) => number), charCount?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
export declare const charGradient: (speed?: number | number[] | ((ctx: SynthContext) => number), charCount?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
export declare const charVoronoi: (scale?: number | number[] | ((ctx: SynthContext) => number), speed?: number | number[] | ((ctx: SynthContext) => number), charCount?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
export declare const charShape: (sides?: number | number[] | ((ctx: SynthContext) => number), innerChar?: number | number[] | ((ctx: SynthContext) => number), outerChar?: number | number[] | ((ctx: SynthContext) => number), radius?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
export declare const charSolid: (charIndex?: number | number[] | ((ctx: SynthContext) => number)) => SynthSource;
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
//# sourceMappingURL=index.d.ts.map