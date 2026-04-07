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
 * {@includeCode ../../examples/cellColor/cellColor/sketch.js}
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
 * {@includeCode ../../examples/cellColor/cellColor2/sketch.js}
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
 *
 * @example
 * {@includeCode ../../examples/cellColor/cellColor3/sketch.js}
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
 * {@includeCode ../../examples/char/char/sketch.js}
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
 * {@includeCode ../../examples/charColor/charColor/sketch.js}
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
 * {@includeCode ../../examples/charColor/charColor2/sketch.js}
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
 *
 * @example
 * {@includeCode ../../examples/charColor/charColor3/sketch.js}
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
 * {@includeCode ../../examples/SynthSource/gradient/sketch.js}
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
 * {@includeCode ../../examples/SynthSource/noise/sketch.js}
 */
export function noise(
    scale?: number | number[] | ((ctx: SynthContext) => number),
    offset?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return generatedFunctions['noise'](scale ?? null, offset ?? null);
}

/**
 * Generate plasma-like sine field patterns.
 * @param scale - Spatial scale of the plasma (default: 10.0)
 * @param speed - Animation speed (default: 0.5)
 * @param phase - Phase offset (default: 0.0)
 * @param contrast - Contrast adjustment (default: 1.0)
 *
 * @example
 * {@includeCode ../../examples/SynthSource/plasma/sketch.js}
 */
export function plasma(
    scale?: number | number[] | ((ctx: SynthContext) => number),
    speed?: number | number[] | ((ctx: SynthContext) => number),
    phase?: number | number[] | ((ctx: SynthContext) => number),
    contrast?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return generatedFunctions['plasma'](
        scale ?? null,
        speed ?? null,
        phase ?? null,
        contrast ?? null
    );
}

/**
 * Generate moire interference patterns.
 * @param freqA - Frequency of first grating (default: 20.0)
 * @param freqB - Frequency of second grating (default: 21.0)
 * @param angleA - Angle of first grating in radians (default: 0.0)
 * @param angleB - Angle of second grating in radians (default: 1.5708)
 * @param speed - Animation speed (default: 0.1)
 * @param phase - Phase offset (default: 0.0)
 *
 * @example
 * {@includeCode ../../examples/SynthSource/moire/sketch.js}
 */
export function moire(
    freqA?: number | number[] | ((ctx: SynthContext) => number),
    freqB?: number | number[] | ((ctx: SynthContext) => number),
    angleA?: number | number[] | ((ctx: SynthContext) => number),
    angleB?: number | number[] | ((ctx: SynthContext) => number),
    speed?: number | number[] | ((ctx: SynthContext) => number),
    phase?: number | number[] | ((ctx: SynthContext) => number)
): SynthSource {
    return generatedFunctions['moire'](
        freqA ?? null,
        freqB ?? null,
        angleA ?? null,
        angleB ?? null,
        speed ?? null,
        phase ?? null
    );
}

/**
 * Generate oscillating patterns using sine waves.
 * @param frequency - Frequency of the oscillation (default: 60.0)
 * @param sync - Synchronization offset (default: 0.1)
 * @param offset - Phase offset (default: 0.0)
 *
 * @example
 * {@includeCode ../../examples/SynthSource/osc/sketch.js}
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
 * {@includeCode ../../examples/paint/paint/sketch.js}
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
 * {@includeCode ../../examples/paint/paint2/sketch.js}
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
 *
 * @example
 * {@includeCode ../../examples/paint/paint3/sketch.js}
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
 * {@includeCode ../../examples/SynthSource/shape/sketch.js}
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
 *
 * @example
 * {@includeCode ../../examples/SynthSource/solid/sketch.js}
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
 * {@includeCode ../../examples/SynthSource/solid2/sketch.js}
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
 * {@includeCode ../../examples/SynthSource/src/sketch.js}
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

    const synthSource = new SynthSource();

    // Handle lazy function
    if (typeof source === 'function') {
        const probeResult = source();
        if (probeResult && isTextmodeLayerObject(probeResult)) {
            const layerId =
                probeResult.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            synthSource.addExternalLayerRef({ layerId, layer: source as () => TextmodeLayer | undefined });
        } else {
            const sourceId = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            synthSource.addTextmodeSourceRef({
                sourceId,
                source: source as () => UpdatableTextmodeSource | undefined,
            });
        }
    } else if (isTextmodeSourceObject(source)) {
        // Check if it's a TextmodeSource (image/video) using duck-typing
        const sourceId = `tms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        synthSource.addTextmodeSourceRef({
            sourceId,
            source: source as UpdatableTextmodeSource,
        });
    } else {
        // Layer provided - create external layer reference
        const layer = source as TextmodeLayer;
        const layerId = layer.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        synthSource.addExternalLayerRef({ layerId, layer });
    }

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
 * Type guard to check if a source is a TextmodeLayer.
 * Uses duck-typing to detect TextmodeLayer instances.
 */
function isTextmodeLayerObject(source: unknown): source is TextmodeLayer {
    return (
        source !== null &&
        typeof source === 'object' &&
        'grid' in source &&
        'drawFramebuffer' in source
    );
}

/**
 * Generate voronoi patterns.
 * @param scale - Scale of voronoi cells (default: 5.0)
 * @param speed - Animation speed (default: 0.3)
 * @param blending - Blending between cell regions (default: 0.3)
 *
 * @example
 * {@includeCode ../../examples/SynthSource/voronoi/sketch.js}
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
