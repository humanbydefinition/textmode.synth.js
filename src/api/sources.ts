/**
 * Typed source function exports for the public API.
 *
 * @module
 */

import type { SynthContext, SynthParameterValue, UpdatableTextmodeSource } from '../core/types';
import { SynthSource } from '../core/SynthSource';
import { generatedFunctions } from '../bootstrap';
import type { TextmodeLayer } from 'textmode.js/layering';
import { TextmodeSource } from 'textmode.js/loadables';

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

/**
 * Create a synth source with cell background color defined using a grayscale value.
 * @param gray - Grayscale value (0-1)
 */
export function cellColor(gray: SynthParameterValue): SynthSource;

export function cellColor(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    return new SynthSource({ cellColorSource: resolveSource(rOrSource, g, b, a) });
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

/**
 * Create a synth source with character foreground color defined using a grayscale value.
 * @param gray - Grayscale value (0-1)
 */
export function charColor(gray: SynthParameterValue): SynthSource;

export function charColor(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    return new SynthSource({ charColorSource: resolveSource(rOrSource, g, b, a) });
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

/**
 * Create a synth source with both character and cell colors defined using a grayscale value.
 * @param gray - Grayscale value (0-1)
 */
export function paint(gray: SynthParameterValue): SynthSource;

export function paint(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    const source = resolveSource(rOrSource, g, b, a);
    return new SynthSource({
        charColorSource: source,
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
 * Sample a source for synth compositions.
 *
 * This is the core of feedback loops and source sampling - it reads from various sources,
 * enabling effects like trails, motion blur, image processing, and recursive patterns.
 *
 * **Three modes of operation:**
 *
 * 1. **Self-feedback** (`src()` with no arguments): Samples from the previous frame
 *    - Context-aware: automatically samples the appropriate texture based on compilation context
 *    - Inside `char(...)` → samples previous frame's character data
 *    - Inside `charColor(...)` → samples previous frame's primary color
 *    - Inside `cellColor(...)` → samples previous frame's cell color
 *
 * 2. **Cross-layer sampling** (`src(layer)`): Samples from another layer's output
 *    - Enables hydra-style multi-output compositions
 *    - Context-aware based on current compilation target
 *
 * 3. **TextmodeSource sampling** (`src(image)` or `src(video)`): Samples from loaded media
 *    - Works with TextmodeImage and TextmodeVideo loaded via `t.loadImage()` or `t.loadVideo()`
 *    - Samples directly from the source texture
 *
 * Equivalent to hydra's `src(o0)`.
 *
 * @param source - Optional source to sample from: TextmodeLayer for cross-layer, or TextmodeImage/TextmodeVideo for media
 * @returns A new SynthSource that samples the specified source or self
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
 * layer1.synth(noise(10).mult(osc(20)));
 * t.layers.base.synth(src(layer1).invert());
 *
 * // TextmodeImage/Video sampling
 * let img;
 * t.setup(async () => {
 *   img = await t.loadImage('https://example.com/image.jpg');
 * });
 * t.layers.base.synth(
 *   char(src(img))
 *     .charColor(src(img))
 *     .cellColor(src(img).invert())
 * );
 *
 * // Lazy evaluation (allows global definition before load)
 * let video;
 * // This works even if video is currently undefined
 * t.layers.base.synth(src(() => video));
 *
 * t.setup(async () => {
 *   video = await t.loadVideo('video.mp4');
 * });
 * ```
 */
export const src = (
    source?:
        | TextmodeLayer
        | TextmodeSource
        | (() => TextmodeSource | TextmodeLayer | undefined)
): SynthSource => {
    // Get the base src function for self-feedback
    const baseSrc = generatedFunctions['src'];

    if (!source) {
        // No source provided - use self-feedback (context-aware)
        return baseSrc();
    }

    // Handle lazy function
    if (typeof source === 'function') {
        const synthSource = new SynthSource();
        const sourceId = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        // We assume function returns a TextmodeSource for type safety in storage
        // If it returns a Layer, we might support that later, but src(layer) path
        // specifically needs TextmodeLayer object for compilation.
        // For now, treat lazy sources as TextmodeSources (images/videos).
        // TODO: Support lazy layers if needed.

        synthSource.addTextmodeSourceRef({
            sourceId,
            source: source as () => UpdatableTextmodeSource | undefined,
        });

        return synthSource;
    }

    // Check if it's a TextmodeSource (image/video) using duck-typing
    if (isTextmodeSourceObject(source)) {
        const synthSource = new SynthSource();
        const sourceId = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        synthSource.addTextmodeSourceRef({
            sourceId,
            source: source as UpdatableTextmodeSource,
        });

        return synthSource;
    }

    // Layer provided - create external layer reference
    const layer = source as TextmodeLayer;
    const synthSource = new SynthSource();
    const layerId = layer.id! ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    synthSource.addExternalLayerRef({
        layerId,
        layer,
    });

    return synthSource;
};

/**
 * Type guard to check if a source is a TextmodeSource (image/video).
 * Uses duck-typing to detect TextmodeImage and TextmodeVideo instances.
 */
function isTextmodeSourceObject(source: unknown): source is TextmodeSource {
    return (
        source !== null &&
        typeof source === 'object' &&
        'texture' in source &&
        'originalWidth' in source &&
        'originalHeight' in source
    );
}

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

/**
 * Helper to resolve overload between SynthSource and parameter values.
 * Used by charColor, cellColor, and paint.
 */
function resolveSource(
    rOrSource: SynthParameterValue,
    g?: SynthParameterValue,
    b?: SynthParameterValue,
    a?: SynthParameterValue
): SynthSource {
    if (rOrSource instanceof SynthSource) {
        return rOrSource;
    }
    return solid(rOrSource, g, b, a);
}
