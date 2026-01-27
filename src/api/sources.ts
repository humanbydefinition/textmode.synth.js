/**
 * Typed source function exports for the public API.
 *
 * @module
 */

import type { SynthContext, SynthParameterValue } from '../core/types';
import { SynthSource } from '../core/SynthSource';
import { generatedFunctions } from '../bootstrap';
import type { TextmodeLayer } from 'textmode.js/layering';

/**
 * Create a synth source with cell background color defined.
 *
 * This function creates a SynthSource where the cell background color
 * is driven by the provided source pattern. This is compositional and can be
 * combined with `char()` and `charColor()`.
 *
 * Accepts either a `SynthSource` (pattern) or RGBA values (solid color).
 *
 * @param source - A SynthSource producing color values
 * @returns A new SynthSource configured with cell color
 *
 * @example
 * ```typescript
 * // Use a pattern source
 * t.layers.base.synth(
 *   cellColor(osc(5).invert())
 * );
 * ```
 */
export function cellColor(source: SynthSource): SynthSource;
/**
 * Create a synth source with cell background color defined using RGBA values.
 *
 * @param r - Red channel (0-1) or value
 * @param g - Green channel (0-1) or value
 * @param b - Blue channel (0-1) or value
 * @param a - Alpha channel (0-1) or value
 * @returns A new SynthSource configured with cell color
 *
 * @example
 * ```typescript
 * // Use a solid color
 * t.layers.base.synth(
 *   cellColor(0, 0, 0, 0.5).char(noise(10))
 * );
 * ```
 */
export function cellColor(
    r: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource;

export function cellColor(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    if (rOrSource instanceof SynthSource) {
        return new SynthSource({ cellColorSource: rOrSource });
    }
    return new SynthSource({ cellColorSource: solid(rOrSource, g, b, a) });
}

/**
 * Create a character source from any color/pattern source.
 *
 * This function converts any pattern (like `osc()`, `noise()`, `voronoi()`) into
 * character indices. The pattern's luminance or color values are mapped to character indices.
 *
 * @param source - A SynthSource producing color values that will be mapped to characters
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
 *   char(noise(10))
 *     .charMap('@#%*+=-:. ')
 * );
 * ```
 */
export const char = (source: SynthSource): SynthSource => {
    return new SynthSource({ charSource: source });
};

/**
 * Create a synth source with character foreground color defined.
 *
 * This function creates a SynthSource where the character foreground color
 * is driven by the provided source pattern. This is compositional and can be
 * combined with `char()` and `cellColor()`.
 *
 * Accepts either a `SynthSource` (pattern) or RGBA values (solid color).
 *
 * @param source - A SynthSource producing color values
 * @returns A new SynthSource configured with character color
 *
 * @example
 * ```typescript
 * // Use a pattern source
 * t.layers.base.synth(
 *   charColor(osc(10, 0.1))
 * );
 * ```
 */
export function charColor(source: SynthSource): SynthSource;
/**
 * Create a synth source with character foreground color defined using RGBA values.
 *
 * @param r - Red channel (0-1) or value
 * @param g - Green channel (0-1) or value
 * @param b - Blue channel (0-1) or value
 * @param a - Alpha channel (0-1) or value
 * @returns A new SynthSource configured with character color
 *
 * @example
 * ```typescript
 * // Use a solid color
 * t.layers.base.synth(
 *   charColor(1, 0, 0).char(noise(10))
 * );
 * ```
 */
export function charColor(
    r: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource;

export function charColor(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    if (rOrSource instanceof SynthSource) {
        return new SynthSource({ colorSource: rOrSource });
    }
    return new SynthSource({ colorSource: solid(rOrSource, g, b, a) });
}

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
    return generatedFunctions['gradient'](speed ?? null);
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
    return generatedFunctions['noise'](scale ?? null, offset ?? null);
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
    return generatedFunctions['osc'](frequency ?? null, sync ?? null, offset ?? null);
}

/**
 * Create a synth source with both character and cell colors defined.
 *
 * This function creates a SynthSource where both the character foreground color
 * and the cell background color are driven by the same source pattern.
 *
 * Accepts either a `SynthSource` (pattern) or RGBA values (solid color).
 *
 * @param source - A SynthSource producing color values
 * @returns A new SynthSource configured with both color sources
 *
 * @example
 * ```typescript
 * // Use same pattern for both foreground and background
 * t.layers.base.synth(
 *   paint(osc(10, 0.1))
 * );
 * ```
 */
export function paint(source: SynthSource): SynthSource;
/**
 * Create a synth source with both character and cell colors defined using RGBA values.
 *
 * @param r - Red channel (0-1) or value
 * @param g - Green channel (0-1) or value
 * @param b - Blue channel (0-1) or value
 * @param a - Alpha channel (0-1) or value
 * @returns A new SynthSource configured with both color sources
 *
 * @example
 * ```typescript
 * // Use solid color for everything
 * t.layers.base.synth(
 *   paint(1, 1, 1)
 * );
 * ```
 */
export function paint(
    r: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource;
export function paint(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    let source: SynthSource;
    if (rOrSource instanceof SynthSource) {
        source = rOrSource;
    } else {
        source = solid(rOrSource, g, b, a);
    }
    return new SynthSource({
        colorSource: source,
        cellColorSource: source,
    });
}

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
    return generatedFunctions['shape'](sides ?? null, radius ?? null, smoothing ?? null);
}

/**
 * Generate a solid grayscale color.
 * @param gray - Grayscale value (0-1)
 */
export function solid(gray: SynthParameterValue): SynthSource;

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
    r?: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource;

export function solid(
    r?: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    // Handle overload for solid(gray)
    // If only first argument is provided and it's a number, pass it as single argument
    // so the underlying factory can replicate it to RGB.
    if (r !== undefined && g === undefined && b === undefined && a === undefined && typeof r === 'number') {
        return generatedFunctions['solid'](r);
    }
    return generatedFunctions['solid'](r ?? null, g ?? null, b ?? null, a ?? null);
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
    const baseSrc = generatedFunctions['src'];

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
    return generatedFunctions['voronoi'](scale ?? null, speed ?? null, blending ?? null);
}
