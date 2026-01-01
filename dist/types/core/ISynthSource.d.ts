import type { SynthParameterValue } from './types';
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
     * // Use block characters
     * osc(1).charMap(' .:-=+*#%@')
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
     * char(osc(5), 8)
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
    osc?: (frequency?: SynthParameterValue, sync?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Generate Perlin noise patterns.
     * @param scale - Scale of the noise pattern (default: 10.0)
     * @param speed - Animation speed (default: 0.1)
     */
    noise?: (scale?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
    /**
     * Generate Voronoi (cellular) patterns.
     * @param scale - Scale of Voronoi cells (default: 5.0)
     * @param speed - Animation speed (default: 0.3)
     * @param blending - Blending between cell regions (default: 0.3)
     */
    voronoi?: (scale?: SynthParameterValue, speed?: SynthParameterValue, blending?: SynthParameterValue) => ISynthSource;
    /**
     * Generate a rotating radial gradient.
     * @param speed - Rotation speed (default: 0.0)
     */
    gradient?: (speed?: SynthParameterValue) => ISynthSource;
    /**
     * Generate geometric shapes (polygons).
     * @param sides - Number of sides (default: 3)
     * @param radius - Radius of the shape (default: 0.3)
     * @param smoothing - Edge smoothing amount (default: 0.01)
     */
    shape?: (sides?: SynthParameterValue, radius?: SynthParameterValue, smoothing?: SynthParameterValue) => ISynthSource;
    /**
     * Generate a solid color.
     * @param r - Red channel (0-1, default: 0.0)
     * @param g - Green channel (0-1, default: 0.0)
     * @param b - Blue channel (0-1, default: 0.0)
     * @param a - Alpha channel (0-1, default: 1.0)
     */
    solid?: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => ISynthSource;
    /**
     * Sample the previous frame's primary color output for feedback effects.
     * This is the core of feedback loops - it reads from the previous frame's
     * rendered output (character foreground color), enabling effects like trails,
     * motion blur, and recursive patterns.
     *
     * Equivalent to hydra's `src(o0)`.
     *
     * @example
     * ```typescript
     * // Classic hydra-style feedback loop with noise modulation
     * src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
     *
     * // Feedback with color shift
     * src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
     * ```
     */
    src?: () => ISynthSource;
    /**
     * Sample the previous frame's character data for feedback effects.
     * Reads from the previous frame's character texture, which contains
     * character index and transform data.
     *
     * Use this to create feedback loops that affect character selection.
     *
     * @example
     * ```typescript
     * // Character feedback with modulation
     * charSrc().modulate(noise(3), 0.01)
     * ```
     */
    charSrc?: () => ISynthSource;
    /**
     * Sample the previous frame's cell/secondary color for feedback effects.
     * Reads from the previous frame's secondary color texture, which contains
     * the cell background color.
     *
     * Use this to create feedback loops that affect cell background colors.
     *
     * @example
     * ```typescript
     * // Cell color feedback
     * cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
     * ```
     */
    cellColorSrc?: () => ISynthSource;
    /**
     * Rotate coordinates.
     * @param angle - Rotation angle in radians (default: 10.0)
     * @param speed - Rotation speed multiplier (default: 0.0)
     *
     * @example
     * ```typescript
     * // Rotate shape continuously
     * charOsc(50, 0, 0, 16)
     *   .rotate((ctx) => ctx.time % 360)
     *   .charColor(osc(50).rotate((ctx) => ctx.time % 360));
     * ```
     */
    rotate?: (angle?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
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
     * charShape(3).scale(1.5, 1, 1);
     * ```
     */
    scale?: (amount?: SynthParameterValue, xMult?: SynthParameterValue, yMult?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => ISynthSource;
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
     * charShape(3).scroll(0.1, -0.3);
     * ```
     */
    scroll?: (scrollX?: SynthParameterValue, scrollY?: SynthParameterValue, speedX?: SynthParameterValue, speedY?: SynthParameterValue) => ISynthSource;
    /**
     * Scroll coordinates in X direction.
     * @param scrollX - X scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    scrollX?: (scrollX?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
    /**
     * Scroll coordinates in Y direction.
     * @param scrollY - Y scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    scrollY?: (scrollY?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
    /**
     * Pixelate the output.
     * @param pixelX - Pixel size in X (default: 20.0)
     * @param pixelY - Pixel size in Y (default: 20.0)
     *
     * @example
     * ```typescript
     * // Pixelate noise pattern
     * charNoise(1, 0.05)
     *   .pixelate(20, 20)
     *   .charColor(noise().pixelate(20, 20));
     * ```
     */
    pixelate?: (pixelX?: SynthParameterValue, pixelY?: SynthParameterValue) => ISynthSource;
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
     * charShape(3)
     *   .repeat(3, 3, 0, 0)
     *   .charColor(shape().repeat(3, 3, 0, 0));
     * ```
     */
    repeat?: (repeatX?: SynthParameterValue, repeatY?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => ISynthSource;
    /**
     * Repeat coordinates in X direction.
     * @param reps - Number of repetitions (default: 3.0)
     * @param offset - Offset between repetitions (default: 0.0)
     */
    repeatX?: (reps?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Repeat coordinates in Y direction.
     * @param reps - Number of repetitions (default: 3.0)
     * @param offset - Offset between repetitions (default: 0.0)
     */
    repeatY?: (reps?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Apply kaleidoscope effect.
     * @param nSides - Number of kaleidoscope sides (default: 4.0)
     *
     * @example
     * ```typescript
     * // Create a 50-sided kaleidoscope pattern
     * charOsc(25, -0.1, 0.5, 32)
     *   .kaleid(50)
     *   .charColor(osc(25, -0.1, 0.5).kaleid(50));
     * ```
     */
    kaleid?: (nSides?: SynthParameterValue) => ISynthSource;
    /**
     * Adjust brightness.
     * @param amount - Brightness adjustment amount (default: 0.4)
     *
     * @example
     * ```typescript
     * // Animate brightness with sine wave
     * charOsc(20, 0, 2, 16)
     *   .charColor(
     *     osc(20, 0, 2).brightness((ctx) => Math.sin(ctx.time))
     *   );
     * ```
     */
    brightness?: (amount?: SynthParameterValue) => ISynthSource;
    /**
     * Adjust contrast.
     * @param amount - Contrast amount (default: 1.6)
     *
     * @example
     * ```typescript
     * // Animate contrast
     * charOsc(20, 0.1, 0, 16)
     *   .charColor(
     *     osc(20).contrast((ctx) => Math.sin(ctx.time) * 5)
     *   );
     * ```
     */
    contrast?: (amount?: SynthParameterValue) => ISynthSource;
    /**
     * Invert colors.
     * @param amount - Inversion amount (default: 1.0)
     *
     * @example
     * ```typescript
     * // Toggle inversion with array
     * charSolid(16)
     *   .charColor(solid(1, 1, 1).invert([0, 1]))
     *   .cellColor(solid(1, 1, 1).invert([1, 0]));
     * ```
     */
    invert?: (amount?: SynthParameterValue) => ISynthSource;
    /**
     * Adjust color saturation.
     * @param amount - Saturation amount (default: 2.0)
     *
     * @example
     * ```typescript
     * // Animate saturation
     * charOsc(10, 0, 1, 16)
     *   .charColor(
     *     osc(10, 0, 1).saturate((ctx) => Math.sin(ctx.time) * 10)
     *   );
     * ```
     */
    saturate?: (amount?: SynthParameterValue) => ISynthSource;
    /**
     * Shift hue.
     * @param hue - Hue shift amount (default: 0.4)
     *
     * @example
     * ```typescript
     * // Animate hue shift
     * charOsc(30, 0.1, 1, 16)
     *   .charColor(
     *     osc(30, 0.1, 1).hue((ctx) => Math.sin(ctx.time))
     *   );
     * ```
     */
    hue?: (hue?: SynthParameterValue) => ISynthSource;
    /**
     * Apply colorama effect (hue rotation based on luminance).
     * @param amount - Effect amount (default: 0.005)
     */
    colorama?: (amount?: SynthParameterValue) => ISynthSource;
    /**
     * Posterize colors to limited palette.
     * @param bins - Number of color bins (default: 3.0)
     * @param gamma - Gamma correction (default: 0.6)
     *
     * @example
     * ```typescript
     * // Posterize gradient with array modulation
     * charGradient(0, 16)
     *   .rotate(1.57)
     *   .charColor(
     *     gradient(0).posterize([1, 5, 15, 30], 0.5)
     *   );
     * ```
     */
    posterize?: (bins?: SynthParameterValue, gamma?: SynthParameterValue) => ISynthSource;
    /**
     * Apply threshold based on luminance.
     * @param threshold - Threshold value (default: 0.5)
     * @param tolerance - Tolerance range (default: 0.1)
     */
    luma?: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => ISynthSource;
    /**
     * Apply hard threshold.
     * @param threshold - Threshold value (default: 0.5)
     * @param tolerance - Tolerance range (default: 0.04)
     */
    thresh?: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => ISynthSource;
    /**
     * Set color channels.
     * @param r - Red channel (default: 1.0)
     * @param g - Green channel (default: 1.0)
     * @param b - Blue channel (default: 1.0)
     * @param a - Alpha channel (default: 1.0)
     */
    color?: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => ISynthSource;
    /**
     * Scale and offset red channel.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     */
    r?: (scale?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Scale and offset green channel.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     */
    g?: (scale?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Scale and offset blue channel.
     * @param scale - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     */
    b?: (scale?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Shift color channels by adding offset values.
     * @param r - Red channel shift (default: 0.5)
     * @param g - Green channel shift (default: 0.0)
     * @param b - Blue channel shift (default: 0.0)
     * @param a - Alpha channel shift (default: 0.0)
     */
    shift?: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => ISynthSource;
    /**
     * Apply gamma correction for nonlinear brightness control.
     * @param amount - Gamma value (default: 1.0, < 1.0 brightens, > 1.0 darkens)
     *
     * @example
     * ```typescript
     * // Brighten midtones
     * charNoise(10)
     *   .charColor(gradient(0).gamma(0.7))
     *
     * // Darken with animation
     * charOsc(8)
     *   .charColor(osc(5).gamma([1.0, 1.5, 2.0].smooth(4)))
     * ```
     */
    gamma?: (amount?: SynthParameterValue) => ISynthSource;
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
     * charNoise(10)
     *   .charColor(noise(5).levels(0.2, 0.8, 0.0, 1.0, 1.0))
     *
     * // Compress highlights, boost shadows
     * charVoronoi(8)
     *   .charColor(voronoi(5).levels(0.0, 1.0, 0.2, 0.9, 0.8))
     * ```
     */
    levels?: (inMin?: SynthParameterValue, inMax?: SynthParameterValue, outMin?: SynthParameterValue, outMax?: SynthParameterValue, gamma?: SynthParameterValue) => ISynthSource;
    /**
     * Clamp color values to a specified range for stability.
     * @param min - Minimum value (default: 0.0)
     * @param max - Maximum value (default: 1.0)
     *
     * @example
     * ```typescript
     * // Prevent overflow after multiple blend operations
     * charOsc(10)
     *   .charColor(
     *     osc(5).add(osc(8), 0.8).add(osc(12), 0.6).clampColor(0.0, 1.0)
     *   )
     *
     * // Create hard clip effect
     * charNoise(8)
     *   .charColor(noise(5).brightness(0.5).clampColor(0.3, 0.7))
     * ```
     */
    clampColor?: (min?: SynthParameterValue, max?: SynthParameterValue) => ISynthSource;
    /**
     * Add another source.
     * @param source - Source to add
     * @param amount - Blend amount (default: 0.5)
     *
     * @example
     * ```typescript
     * // Add two shapes with animated blend amount
     * charShape(3)
     *   .scale(0.5)
     *   .charColor(
     *     shape(3)
     *       .scale(0.5)
     *       .add(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
     *   );
     * ```
     */
    add?: (source: ISynthSource, amount?: SynthParameterValue) => ISynthSource;
    /**
     * Subtract another source.
     * @param source - Source to subtract
     * @param amount - Blend amount (default: 0.5)
     */
    sub?: (source: ISynthSource, amount?: SynthParameterValue) => ISynthSource;
    /**
     * Multiply with another source.
     * @param source - Source to multiply
     * @param amount - Blend amount (default: 0.5)
     */
    mult?: (source: ISynthSource, amount?: SynthParameterValue) => ISynthSource;
    /**
     * Blend with another source.
     * @param source - Source to blend
     * @param amount - Blend amount (default: 0.5)
     *
     * @example
     * ```typescript
     * // Blend two shapes
     * charShape(3)
     *   .scale(0.5)
     *   .charColor(
     *     shape(3)
     *       .scale(0.5)
     *       .blend(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1])
     *   );
     * ```
     */
    blend?: (source: ISynthSource, amount?: SynthParameterValue) => ISynthSource;
    /**
     * Difference with another source.
     * @param source - Source to compare
     *
     * @example
     * ```typescript
     * // Create difference pattern between two oscillators
     * charOsc(9, 0.1, 2, 16)
     *   .charColor(
     *     osc(9, 0.1, 2).diff(osc(13, 0.5, 5))
     *   );
     * ```
     */
    diff?: (source: ISynthSource) => ISynthSource;
    /**
     * Layer another source on top.
     * @param source - Source to layer
     */
    layer?: (source: ISynthSource) => ISynthSource;
    /**
     * Mask using another source.
     * @param source - Source to use as mask
     *
     * @example
     * ```typescript
     * // Mask gradient with voronoi pattern
     * charGradient(0, 16)
     *   .charColor(
     *     gradient(5).mask(voronoi()).invert([0, 1])
     *   );
     * ```
     */
    mask?: (source: ISynthSource) => ISynthSource;
    /**
     * Modulate coordinates using another source.
     * @param source - Modulation source
     * @param amount - Modulation amount (default: 0.1)
     *
     * @example
     * ```typescript
     * // Modulate voronoi with kaleidoscope pattern
     * charVoronoi(5, 0.3, 16)
     *   .rotate((ctx) => (ctx.time % 360) / 2)
     *   .modulate(
     *     osc(25, 0.1, 0.5)
     *       .kaleid(50)
     *       .scale((ctx) => Math.sin(ctx.time) * 0.5 + 1)
     *       .modulate(noise(0.6, 0.5)),
     *     0.5
     *   );
     * ```
     */
    modulate?: (source: ISynthSource, amount?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate scale using another source.
     * @param source - Modulation source
     * @param multiple - Scale multiplier (default: 1.0)
     * @param offset - Offset amount (default: 1.0)
     */
    modulateScale?: (source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate rotation using another source.
     * @param source - Modulation source
     * @param multiple - Rotation multiplier (default: 1.0)
     * @param offset - Offset amount (default: 0.0)
     */
    modulateRotate?: (source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate pixelation using another source.
     * @param source - Modulation source
     * @param multiple - Pixelation multiplier (default: 10.0)
     * @param offset - Offset amount (default: 3.0)
     */
    modulatePixelate?: (source: ISynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate kaleidoscope using another source.
     * @param source - Modulation source
     * @param nSides - Number of sides (default: 4.0)
     */
    modulateKaleid?: (source: ISynthSource, nSides?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate X scroll using another source.
     * @param source - Modulation source
     * @param scrollX - X scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    modulateScrollX?: (source: ISynthSource, scrollX?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
    /**
     * Modulate Y scroll using another source.
     * @param source - Modulation source
     * @param scrollY - Y scroll amount (default: 0.5)
     * @param speed - Scroll speed (default: 0.0)
     */
    modulateScrollY?: (source: ISynthSource, scrollY?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
    /**
     * Generate character indices using Perlin noise.
     * @param scale - Scale of the noise pattern (default: 10.0)
     * @param speed - Animation speed (default: 0.1)
     * @param charCount - Number of different characters to use (default: 256)
     */
    charNoise?: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => ISynthSource;
    /**
     * Generate character indices using oscillating sine waves.
     * @param frequency - Frequency of the oscillation (default: 60.0)
     * @param sync - Synchronization offset (default: 0.1)
     * @param charCount - Number of different characters to use (default: 256)
     */
    charOsc?: (frequency?: SynthParameterValue, sync?: SynthParameterValue, charCount?: SynthParameterValue) => ISynthSource;
    /**
     * Generate character indices using a gradient.
     * @param charCount - Number of different characters to use (default: 256)
     * @param direction - Gradient direction (default: 0.0)
     */
    charGradient?: (charCount?: SynthParameterValue, direction?: SynthParameterValue) => ISynthSource;
    /**
     * Generate character indices using Voronoi (cellular) patterns.
     * @param scale - Scale of Voronoi cells (default: 5.0)
     * @param speed - Animation speed (default: 0.3)
     * @param charCount - Number of different characters to use (default: 256)
     */
    charVoronoi?: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => ISynthSource;
    /**
     * Generate character indices based on geometric shapes (polygons).
     * @param sides - Number of sides (default: 3)
     * @param innerChar - Character index for inside the shape (default: 0)
     * @param outerChar - Character index for outside the shape (default: 1)
     * @param radius - Radius of the shape (default: 0.3)
     */
    charShape?: (sides?: SynthParameterValue, innerChar?: SynthParameterValue, outerChar?: SynthParameterValue, radius?: SynthParameterValue) => ISynthSource;
    /**
     * Generate a solid character index across the entire canvas.
     * @param charIndex - Character index to use (default: 0)
     */
    charSolid?: (charIndex?: SynthParameterValue) => ISynthSource;
    /**
     * Flip characters horizontally.
     * @param toggle - Toggle flip (default: 1.0)
     */
    charFlipX?: (toggle?: SynthParameterValue) => ISynthSource;
    /**
     * Flip characters vertically.
     * @param toggle - Toggle flip (default: 1.0)
     */
    charFlipY?: (toggle?: SynthParameterValue) => ISynthSource;
    /**
     * Invert character indices.
     * @param toggle - Toggle invert (default: 1.0)
     */
    charInvert?: (toggle?: SynthParameterValue) => ISynthSource;
    /**
     * Rotate characters.
     * @param angle - Rotation angle in radians (default: 0.0)
     * @param speed - Rotation speed (default: 0.0)
     */
    charRotate?: (angle?: SynthParameterValue, speed?: SynthParameterValue) => ISynthSource;
}
//# sourceMappingURL=ISynthSource.d.ts.map