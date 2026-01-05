/**
 * Typed source function exports for the public API.
 *
 * @module
 */

import type { SynthContext } from '../core/types';
import { SynthSource } from '../core/SynthSource';
import { generatedFunctions } from '../bootstrap';
import { TextmodeLayer } from 'textmode.js';

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
export const cellColor = (source: SynthSource): SynthSource => {
    const result = new SynthSource();
    (result as any)._colorSource = source;
    return result;
};

/**
 * Create a character source from any color/pattern source.
 *
 * This function converts any pattern (like `osc()`, `noise()`, `voronoi()`) into
 * character indices. The pattern's luminance or color values are mapped to character indices.
 *
 * @param source - A SynthSource producing color values that will be mapped to characters
 * @param charCount - Number of different characters to use (default: 256)
 * @returns A new SynthSource configured for character generation
 *
 * @example
 * ```typescript
 * // Simple usage - same pattern for chars and colors
 * const pattern = osc(1, 0.1);
 * t.layers.base.synth(
 *   char(pattern)
 *     .charColor(pattern.clone())
 * );
 *
 * // With limited character count
 * t.layers.base.synth(
 *   char(noise(10), 16)
 *     .charMap('@#%*+=-:. ')
 * );
 * ```
 */
export const char = (source: SynthSource, charCount?: number): SynthSource => {
    const result = new SynthSource();

    // Access private properties via any cast (internal API)
    (result as any)._charSource = source;
    (result as any)._charCount = charCount;

    return result;
};

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
export const charColor = (source: SynthSource): SynthSource => {
    const result = new SynthSource();
    (result as any)._colorSource = source;
    return result;
};

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
 * );
 * ```
 */
export function gradient(
    speed?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['gradient'] as Function)(speed);
}

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
 * );
 * ```
 */
export function noise(
    scale?: number | number[] | ((ctx: SynthContext) => number),
    offset?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['noise'] as Function)(scale, offset);
}

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
 *     .cellColor(osc(10, 0.1))
 * );
 *
 * // Animated frequency using array modulation
 * t.layers.base.synth(
 *   osc([1, 10, 50, 100].fast(2), 0.001)
 * );
 * ```
 */
export function osc(
    frequency?: number | number[] | ((ctx: SynthContext) => number),
    sync?: number | number[] | ((ctx: SynthContext) => number),
    offset?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['osc'] as Function)(frequency, sync, offset);
}

/**
 * Create a synth source with both character and cell colors defined.
 *
 * This function creates a SynthSource where both the character foreground color
 * and the cell background color are driven by the same source pattern.
 * This is a convenience function equivalent to calling both `charColor()` and
 * `cellColor()` with the same source, allowing for easy pixel art without visible characters.
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
 * t.layers.base.synth(
 *   paint(osc(10, 0.1).mult(voronoi(5)))
 * );
 *
 * // Paint with gradient
 * t.layers.base.synth(
 *   paint(gradient(0.5))
 * );
 * ```
 */
export const paint = (source: SynthSource): SynthSource => {
    const result = new SynthSource();
    (result as any)._colorSource = source;
    (result as any)._cellColorSource = source;
    return result;
};

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
 * );
 *
 * // High-sided polygon (ellipse-like)
 * t.layers.base.synth(
 *   shape(100)
 * );
 * ```
 */
export function shape(
    sides?: number | number[] | ((ctx: SynthContext) => number),
    radius?: number | number[] | ((ctx: SynthContext) => number),
    smoothing?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['shape'] as Function)(sides, radius, smoothing);
}

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
 *     .cellColor(solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1).invert())
 * );
 * ```
 */
export function solid(
    r?: number | number[] | ((ctx: SynthContext) => number),
    g?: number | number[] | ((ctx: SynthContext) => number),
    b?: number | number[] | ((ctx: SynthContext) => number),
    a?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['solid'] as Function)(r, g, b, a);
}

/**
 * Sample the previous frame's output for feedback effects.
 *
 * This is the core of feedback loops - it reads from the previous frame,
 * enabling effects like trails, motion blur, and recursive patterns.
 *
 * **Context-aware behavior:** When called without arguments, `src()` automatically
 * samples the appropriate texture based on where it's used in the synth chain:
 * - Inside `char(...)` → samples previous frame's character data
 * - Inside `charColor(...)` → samples previous frame's primary color
 * - Inside `cellColor(...)` → samples previous frame's cell color
 *
 * **Cross-layer sampling:** When called with a layer argument, `src(layer)` samples
 * from another layer's output, enabling hydra-style multi-output compositions:
 * - The sampled texture is still context-aware based on the current compilation target
 *
 * Equivalent to hydra's `src(o0)`.
 *
 * @param layer - Optional TextmodeLayer to sample from. If omitted, samples from self (feedback).
 * @returns A new SynthSource that samples the specified layer or self
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
 * // Cross-layer sampling (hydra-style o0, o1, etc.)
 * const layer1 = t.layers.add();
 * const layer2 = t.layers.add();
 *
 * layer1.synth(noise(10).mult(osc(20)));
 *
 * layer2.synth(
 *   char(voronoi(5).diff(src(layer1)))  // Sample layer1's char texture
 *     .charColor(osc(10).blend(src(layer1), 0.5))  // Sample layer1's primary color
 * );
 *
 * // Complex multi-layer composition
 * t.layers.base.synth(
 *   noise(3, 0.3).thresh(0.3).diff(src(layer2), 0.3)
 * );
 * ```
 */
export const src = (layer?: TextmodeLayer): SynthSource => {
    // Get the base src function for self-feedback
    const baseSrc = generatedFunctions['src'] as () => SynthSource;

    if (!layer) {
        // No layer provided - use self-feedback (context-aware)
        return baseSrc();
    }

    // Layer provided - create external layer reference
    const source = new SynthSource();
    const layerId = layer.id! ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    source.addExternalLayerRef({
        layerId,
        layer,
    });

    return source;
};

/**
 * Generate voronoi patterns.
 * @param scale - Scale of voronoi cells (default: 5.0)
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
 * );
 * ```
 */
export function voronoi(
    scale?: number | number[] | ((ctx: SynthContext) => number),
    speed?: number | number[] | ((ctx: SynthContext) => number),
    blending?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return (generatedFunctions['voronoi'] as Function)(scale, speed, blending);
}
