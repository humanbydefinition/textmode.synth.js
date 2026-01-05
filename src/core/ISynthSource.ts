import type { SynthParameterValue } from './types';

/**
 * Interface defining all chainable methods available on SynthSource.
 * 
 * This interface serves as the authoritative documentation for all
 * synthesis methods. The SynthSource class implements this interface
 * and inherits the JSDoc documentation from it.
 * 
 * Methods are organized by category:
 * - Special textmode methods (charMap, charColor, cellColor, etc.)
 * - Source generators (osc, noise, voronoi, gradient, shape, solid, src)
 * - Coordinate transforms (rotate, scale, scroll, pixelate, repeat, kaleid)
 * - Color transforms (brightness, contrast, invert, saturate, hue, etc.)
 * - Combine operations (add, sub, mult, blend, diff, layer, mask)
 * - Modulation (modulate, modulateScale, modulateRotate, etc.)
 */
export interface ISynthSource {

    /**
     * Map character indices to a specific character set.
     * This is the primary textmode-native way to define which characters to use.
     *
     * @param chars A string of characters to map indices to
     * @returns The SynthSource for chaining
     *
     * @example
     * ```ts
     * // Map noise values to ASCII art characters
     * noise(10).charMap('@#%*+=-:. ')
     *
     * // Use lowercase alphabet characters
     * osc(1).charMap('abcdefghijklmnopqrstuvwxyz')
     *
     * // Use custom symbols
     * gradient().charMap('-<>^v')
     * ```
     */
    charMap(chars: string): this;

    /**
     * Set the character foreground color using a color source chain.
     *
     * @param source A SynthSource producing color values, or RGBA values
     * @returns The SynthSource for chaining
     *
     * @example
     * ```ts
     * // Use oscillator for grayscale colors
     * noise(10).charColor(osc(5, 0.1))
     *
     * // Use solid color
     * noise(10).charColor(solid(1, 0.5, 0))
     *
     * // Use gradient
     * noise(10).charColor(gradient(0.5).hue(0.3))
     * ```
     */
    charColor(source: ISynthSource): this;

    /**
     * Set the cell background colors using a color source chain.
     *
     * @param source A SynthSource producing color values, or RGBA values
     * @returns The SynthSource for chaining
     *
     * @example
     * ```ts
     * // Transparent background
     * noise(10).cellColor(solid(0, 0, 0, 0))
     *
     * // Complement of character color
     * noise(10).charColor(osc(5)).cellColor(osc(5).invert())
     * ```
     */
    cellColor(source: ISynthSource): this;

    /**
     * Set the character indices using a character source chain.
     * 
     * @param source A synth source producing character indices
     * @param charCount Number of different characters to use from the character mapping
     * @returns The SynthSource for chaining
     *
     * @example
     * ```ts
     * // Use noise to select characters
     * char(noise(10), 16)
     * 
     * // Use oscillator to select characters
     * char(osc(5), 32)
     * ```
     */
    char(source: ISynthSource, charCount: number): this;

    /**
     * Set both character foreground and cell background color using the same source chain.
     * This is a convenience method that combines `.charColor()` and `.cellColor()` in one call.
     *
     * After calling `paint()`, you can still override the cell color separately using `.cellColor()`.
     * 
     * Otherwise useful for pixel art styles where both colors are the same, making the characters redundant.
     *
     * @param source A SynthSource producing color values
     * @returns The SynthSource for chaining
     *
     * @example
     * ```ts
     * // Apply same color to both character and cell background
     * noise(10).paint(osc(5, 0.1).kaleid(4))
     *
     * // Apply color to both, then invert just the cell background
     * noise(10)
     *   .paint(voronoi(10, 0.5).mult(osc(20)))
     *   .cellColor(voronoi(10, 0.5).mult(osc(20)).invert())
     * ```
     */
    paint(source: ISynthSource): this;

    /**
     * Create a deep clone of this SynthSource.
     * Useful when you want to create a modified version of an existing chain
     * without affecting the original.
     *
     * @returns A new SynthSource with the same transform chain
     *
     * @example
     * ```ts
     * // Create a color chain and use a modified clone for cell color
     * const colorChain = voronoi(10, 0.5).mult(osc(20));
     * 
     * noise(10)
     *   .paint(colorChain)
     *   .cellColor(colorChain.clone().invert())
     * 
     * // Or use it to create variations of a base pattern
     * const base = osc(10, 0.1);
     * const rotated = base.clone().rotate(0.5);
     * const scaled = base.clone().scale(2);
     * ```
     */
    clone(): ISynthSource;

    /**
     * Generate oscillating patterns using sine waves.
     * @param frequency - Frequency of the oscillation (default: 60.0)
     * @param sync - Synchronization offset (default: 0.1)
     * @param offset - Phase offset (default: 0.0)
     */
    osc(frequency?: SynthParameterValue, sync?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Generate Perlin noise patterns.
     * @param scale - Scale of the noise pattern (default: 10.0)
     * @param speed - Animation speed (default: 0.1)
     */
    noise(scale?: SynthParameterValue, speed?: SynthParameterValue): this;

    /**
     * Generate voronoi patterns.
     * @param scale - Scale of voronoi cells (default: 5.0)
     * @param speed - Animation speed (default: 0.3)
     * @param blending - Blending between cell regions (default: 0.3)
     */
    voronoi(scale?: SynthParameterValue, speed?: SynthParameterValue, blending?: SynthParameterValue): this;

    /**
     * Generate a rotating radial gradient.
     * @param speed - Rotation speed (default: 0.0)
     * 
     * @example
     * ```typescript
     * gradient([1,2,4])
     * ```
     */
    gradient(speed?: SynthParameterValue): this;

    /**
     * Generate geometric shapes (polygons).
     * @param sides - Number of sides (default: 3)
     * @param radius - Radius of the shape (default: 0.3)
     * @param smoothing - Edge smoothing amount (default: 0.01)
     */
    shape(sides?: SynthParameterValue, radius?: SynthParameterValue, smoothing?: SynthParameterValue): this;

    /**
     * Generate a solid color.
     * @param r - Red channel (0-1, default: 0.0)
     * @param g - Green channel (0-1, default: 0.0)
     * @param b - Blue channel (0-1, default: 0.0)
     * @param a - Alpha channel (0-1, default: 1.0)
     */
    solid(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;

    /**
     * Sample the previous frame for feedback effects, or sample from another layer.
     * 
     * **Self-feedback (no argument):** `src()` samples the current layer's previous frame.
     * The sampled texture is context-aware based on where it's used in the synth chain:
     * 
     * - Inside `char(...)` → samples previous frame's character data
     * - Inside `charColor(...)` → samples previous frame's primary color (character foreground)
     * - Inside `cellColor(...)` → samples previous frame's cell color (character background)
     * - Outside all three → samples previous frame's primary color
     * 
     * **Cross-layer sampling (with layer argument):** `src(layer)` samples from another 
     * layer's output, enabling hydra-style multi-output compositions. The sampled texture
     * is still context-aware based on the current compilation target.
     * 
     * This is the core of feedback loops and multi-layer compositions - enabling effects 
     * like trails, motion blur, recursive patterns, and complex layered visuals.
     * Equivalent to hydra's `src(o0)`.
     * 
     * @param layer - Optional TextmodeLayer to sample from. If omitted, samples from self (feedback).
     * 
     * @example
     * ```typescript
     * // Classic hydra-style feedback loop with noise modulation
     * src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
     * 
     * // Feedback with color shift
     * src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
     * 
     * // Context-aware: src() samples the appropriate texture automatically
     * char(noise(10).diff(src()))           // src() → character feedback
     *   .charColor(osc(5).blend(src(), 0.5)) // src() → primary color feedback
     *   .cellColor(voronoi().diff(src()))    // src() → cell color feedback
     * ```
     */
    src(layer?: unknown): this;

    /**
     * Rotate coordinates.
     * @param angle - Rotation angle in radians (default: 10.0)
     * @param speed - Rotation speed multiplier (default: 0.0)
     * 
     * @example
     * ```typescript
     * // Rotate shape continuously
     * osc(50, 0, 0, 16)
     *   .rotate((ctx) => ctx.time % 360)
     *   .charColor(osc(50).rotate((ctx) => ctx.time % 360));
     * ```
     */
    rotate(angle?: SynthParameterValue, speed?: SynthParameterValue): this;

    /**
     * Scale coordinates.
     * @param amount - Scale amount (default: 1.5)
     * @param xMult - X axis multiplier (default: 1.0)
     * @param yMult - Y axis multiplier (default: 1.0)
     * @param offsetX - X offset (default: 0.5)
     * @param offsetY - Y offset (default: 0.5)
     * 
     * @example
     * ```typescript
     * // Scale a triangle shape
     * shape(3).scale(1.5, 1, 1);
     * ```
     */
    scale(amount?: SynthParameterValue, xMult?: SynthParameterValue, yMult?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue): this;

    /**
     * Scroll coordinates in both X and Y directions.
     * @param scrollX - X scroll amount (default: 0.5)
     * @param scrollY - Y scroll amount (default: 0.5)
     * @param speedX - X scroll speed (default: 0.0)
     * @param speedY - Y scroll speed (default: 0.0)
     * 
     * @example
     * ```typescript
     * // Scroll a shape diagonally
     * shape(3).scroll(0.1, -0.3);
     * ```
     */
    scroll(scrollX?: SynthParameterValue, scrollY?: SynthParameterValue, speedX?: SynthParameterValue, speedY?: SynthParameterValue): this;

    /**
     * Scroll coordinates in X direction.
     * @param scrollX - X scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    scrollX(scrollX?: SynthParameterValue, speed?: SynthParameterValue): this;

    /**
     * Scroll coordinates in Y direction.
     * @param scrollY - Y scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    scrollY(scrollY?: SynthParameterValue, speed?: SynthParameterValue): this;

    /**
     * Pixelate the output.
     * @param pixelX - Pixel size in X (default: 20.0)
     * @param pixelY - Pixel size in Y (default: 20.0)
     * 
     * @example
     * ```typescript
     * // Pixelate noise pattern
     * noise(1, 0.05)
     *   .pixelate(20, 20)
     *   .charColor(noise().pixelate(20, 20));
     * ```
     */
    pixelate(pixelX?: SynthParameterValue, pixelY?: SynthParameterValue): this;

    /**
     * Repeat coordinates in both X and Y directions.
     * @param repeatX - Number of X repetitions (default: 3.0)
     * @param repeatY - Number of Y repetitions (default: 3.0)
     * @param offsetX - X offset between repetitions (default: 0.0)
     * @param offsetY - Y offset between repetitions (default: 0.0)
     * 
     * @example
     * ```typescript
     * // Repeat a shape in a 3x3 grid
     * shape(3)
     *   .repeat(3, 3, 0, 0)
     *   .charColor(shape().repeat(3, 3, 0, 0));
     * ```
     */
    repeat(repeatX?: SynthParameterValue, repeatY?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue): this;

    /**
     * Repeat coordinates in X direction.
     * @param reps - Number of repetitions (default: 3.0)
     * @param offset - Offset between repetitions (default: 0.0)
     */
    repeatX(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Repeat coordinates in Y direction.
     * @param reps - Number of repetitions (default: 3.0)
     * @param offset - Offset between repetitions (default: 0.0)
     */
    repeatY(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Apply kaleidoscope effect.
     * @param nSides - Number of kaleidoscope sides (default: 4.0)
     * 
     * @example
     * ```typescript
     * // Create a 50-sided kaleidoscope pattern
     * osc(25, -0.1, 0.5, 32)
     *   .kaleid(50)
     *   .charColor(osc(25, -0.1, 0.5).kaleid(50));
     * ```
     */
    kaleid(nSides?: SynthParameterValue): this;

    /**
     * Adjust brightness.
     * @param amount - Brightness adjustment amount (default: 0.4)
     * 
     * @example
     * ```typescript
     * osc(1)
     *   .charColor(
     *     osc(20, 0, 2).brightness(() => Math.sin(t.secs()))
     *   )
     * ```
     */
    brightness(amount?: SynthParameterValue): this;

    /**
     * Adjust contrast.
     * @param amount - Contrast amount (default: 1.6)
     * 
     * @example
     * ```typescript
     * osc(1)
     *   .charColor(
     *     osc(20).contrast((ctx) => Math.sin(ctx.time) * 5)
     *   )
     * ```
     */
    contrast(amount?: SynthParameterValue): this;

    /**
     * Invert colors.
     * @param amount - Inversion amount (default: 1.0)
     * 
     * @example
     * ```typescript
     *  solid(0.2, 0, 0, 1)
     *     .charColor(solid(1, 1, 1).invert([0, 1]))
     *     .cellColor(solid(1, 1, 1).invert([1, 0]))
     * ```
     */
    invert(amount?: SynthParameterValue): this;

    /**
     * Adjust color saturation.
     * @param amount - Saturation amount (default: 2.0)
     * 
     * @example
     * ```typescript
     * // Animate saturation
     * osc(10, 0, 1, 16)
     *   .charColor(
     *     osc(10, 0, 1).saturate((ctx) => Math.sin(ctx.time) * 10)
     *   );
     * ```
     */
    saturate(amount?: SynthParameterValue): this;

    /**
     * Shift hue.
     * @param hue - Hue shift amount (default: 0.4)
     * 
     * @example
     * ```typescript
     * osc(1)
     *   .charColor(
     *     osc(30, 0.1, 1).hue((ctx) => Math.sin(ctx.time))
     *   )
     * ```
     */
    hue(hue?: SynthParameterValue): this;

    /**
     * Apply colorama effect (hue rotation based on luminance).
     * @param amount - Effect amount (default: 0.005)
     * 
     * @example
     * ```typescript
     * // Create color cycle effect on oscillator
     * noise(4).colorama(0.3)
     * ```
     */
    colorama(amount?: SynthParameterValue): this;

    /**
     * Posterize colors to limited palette.
     * @param bins - Number of color bins (default: 3.0)
     * @param gamma - Gamma correction (default: 0.6)
     * 
     * @example
     * ```typescript
     * // Posterize gradient with array modulation
     * gradient(0, 16)
     *   .rotate(1.57)
     *   .charColor(
     *     gradient(0).posterize([1, 5, 15, 30], 0.5)
     *   );
     * ```
     */
    posterize(bins?: SynthParameterValue, gamma?: SynthParameterValue): this;

    /**
     * Apply threshold based on luminance.
     * @param threshold - Threshold value (default: 0.5)
     * @param tolerance - Tolerance range (default: 0.1)
     * 
     * @example
     * ```typescript
     * // Apply threshold to oscillator
     * osc(10,0,1).luma(0.5,0.1)
     * ```
     */
    luma(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this;

    /**
     * Apply hard threshold.
     * @param threshold - Threshold value (default: 0.5)
     * @param tolerance - Tolerance range (default: 0.04)
     */
    thresh(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this;

    /**
     * Colorize a grayscale source or multiply an existing color source.
     * 
     * This is the recommended way to add color to grayscale sources like `osc()`,
     * `noise()`, or `voronoi()`.
     * 
     * @param r - Red channel multiplier (default: 1.0)
     * @param g - Green channel multiplier (default: 1.0)
     * @param b - Blue channel multiplier (default: 1.0)
     * @param a - Alpha channel multiplier (default: 1.0)
     * 
     * @example
     * ```typescript
     * // Create a blue oscillator
     * osc(10).color(0, 0.5, 1.0)
     * 
     * // Colorize noise with a red tint
     * noise(5).color(1, 0.2, 0.2)
     * ```
     */
    color(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;

    /**
     * Extract the red channel as a grayscale value.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     * 
     * @example
     * ```typescript
     * // Extract red channel as grayscale
     * voronoi(5).hue(0.4).r()
     * 
     * // Convert red intensity to character indices
     * char(osc(10).hue(0.5).r(), 16)
     * ```
     */
    r(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Extract the green channel as a grayscale value.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     * 
     * @example
     * ```typescript
     * osc(4,0.1,1.5).layer(gradient().g())
     * ```
     */
    g(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Extract the blue channel as a grayscale value.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     * 
     * @example
     * ```typescript
     * osc(8,0.1,1.5).layer(gradient().colorama(1).b())
     * ```
     */
    b(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Shift color channels by adding offset values.
     * @param r - Red channel shift (default: 0.5)
     * @param g - Green channel shift (default: 0.0)
     * @param b - Blue channel shift (default: 0.0)
     * @param a - Alpha channel shift (default: 0.0)
     */
    shift(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;

    /**
     * Apply gamma correction for nonlinear brightness control.
     * @param amount - Gamma value (default: 1.0, < 1.0 brightens, > 1.0 darkens)
     * 
     * @example
     * ```typescript
     * osc(1)
     *   .charColor(osc(5).gamma([1.0, 1.5, 2.0].smooth(4)))
     * ```
     */
    gamma(amount?: SynthParameterValue): this;

    /**
     * Adjust input/output levels and gamma for precise tonal control.
     * @param inMin - Input minimum (default: 0.0)
     * @param inMax - Input maximum (default: 1.0)
     * @param outMin - Output minimum (default: 0.0)
     * @param outMax - Output maximum (default: 1.0)
     * @param gamma - Gamma correction (default: 1.0)
     * 
     * @example
     * ```typescript
     * // Expand tonal range from 0.2-0.8 to 0-1
     * noise(10)
     *   .charColor(noise(5).levels(0.2, 0.8, 0.0, 1.0, 1.0))
     * 
     * // Compress highlights, boost shadows
     * voronoi(8)
     *   .charColor(voronoi(5).levels(0.0, 1.0, 0.2, 0.9, 0.8))
     * ```
     */
    levels(inMin?: SynthParameterValue, inMax?: SynthParameterValue, outMin?: SynthParameterValue, outMax?: SynthParameterValue, gamma?: SynthParameterValue): this;

    /**
     * Clamp color values to a specified range for stability.
     * @param min - Minimum value (default: 0.0)
     * @param max - Maximum value (default: 1.0)
     * 
     * @example
     * ```typescript
     * osc(5).add(osc(8), 0.8).add(osc(12), 0.6).clamp(0.2, 0.8)
     * ```
     */
    clamp(min?: SynthParameterValue, max?: SynthParameterValue): this;

    /**
     * Add another source.
     * @param source - Source to add
     * @param amount - Blend amount (default: 0.5)
     * 
     * @example
     * ```typescript
     * // Add two shapes with animated blend amount
     * shape(3)
     *   .scale(0.5)
     *   .add(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
     * ```
     */
    add(source: ISynthSource, amount?: SynthParameterValue): this;

    /**
     * Subtract another source.
     * @param source - Source to subtract
     * @param amount - Blend amount (default: 0.5)
     */
    sub(source: ISynthSource, amount?: SynthParameterValue): this;

    /**
     * Multiply with another source.
     * @param source - Source to multiply
     * @param amount - Blend amount (default: 0.5)
     */
    mult(source: ISynthSource, amount?: SynthParameterValue): this;

    /**
     * Blend with another source.
     * @param source - Source to blend
     * @param amount - Blend amount (default: 0.5)
     * 
     * @example
     * ```typescript
     * // Blend two shapes
     * shape(3)
     *   .scale(0.5)
     *   .blend(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
     * ```
     */
    blend(source: ISynthSource, amount?: SynthParameterValue): this;

    /**
     * Difference with another source.
     * @param source - Source to compare
     * 
     * @example
     * ```typescript
     * osc(1, 0.1, 2).diff(osc(1, 0.5, 5))
     * ```
     */
    diff(source: ISynthSource): this;

    /**
     * Layer another source on top.
     * @param source - Source to layer
     * 
     * @example
     * ```typescript
     *   osc(1)
     *   .charColor(osc(30).layer(osc(15).rotate(1).luma()))
     *   .cellColor(osc(30).layer(osc(15).rotate(1).luma()).invert())
     * ```
     */
    layer(source: ISynthSource): this;

    /**
     * Mask using another source.
     * @param source - Source to use as mask
     * 
     * @example
     * ```typescript
     * // Mask gradient with voronoi pattern
     * gradient(5).mask(voronoi()).invert([0, 1])
     * ```
     */
    mask(source: ISynthSource): this;

    /**
     * Modulate coordinates using another source.
     * @param source - Modulation source
     * @param amount - Modulation amount (default: 0.1)
     * 
     * @example
     * ```typescript
     * osc(3, 0, 2)
     *     .modulate(noise().add(gradient(), -1), 1)
     * ```
     */
    modulate(source: ISynthSource, amount?: SynthParameterValue): this;

    /**
     * Modulate scale using another source.
     * @param source - Modulation source
     * @param multiple - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 1.0)
     */
    modulateScale(source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Modulate rotation using another source.
     * @param source - Modulation source
     * @param multiple - Rotation multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     */
    modulateRotate(source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Modulate pixelation using another source.
     * @param source - Modulation source
     * @param multiple - Pixelation multiplier (default: 10.0)
     * @param offset - Offset amount (default: 3.0)
     * 
     * @example
     * ```typescript
     * noise(3).modulatePixelate(noise(1, 0).pixelate(8, 8), 1024, 8)
     * ```
     */
    modulatePixelate(source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this;

    /**
     * Modulate kaleidoscope using another source.
     * @param source - Modulation source
     * @param nSides - Number of sides (default: 4.0)
     * 
     * @example
     * ```typescript
     * osc(2, 0.1, 2)
     *     .modulateKaleid(osc(16).kaleid(999), 1)
     * ```
     */
    modulateKaleid(source: ISynthSource, nSides?: SynthParameterValue): this;

    /**
     * Modulate X scroll using another source.
     * @param source - Modulation source
     * @param scrollX - X scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    modulateScrollX(source: ISynthSource, scrollX?: SynthParameterValue, speed?: SynthParameterValue): this;

    /**
     * Modulate Y scroll using another source.
     * @param source - Modulation source
     * @param scrollY - Y scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    modulateScrollY(source: ISynthSource, scrollY?: SynthParameterValue, speed?: SynthParameterValue): this;
}