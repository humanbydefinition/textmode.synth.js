import type { TextmodeLayer } from 'textmode.js/layering';
import type { ExternalLayerReference, SynthParameterValue } from './types';

/**
 * Interface defining all chainable methods available on SynthSource.
 *
 * This interface serves as the authoritative documentation for all
 * synthesis methods.
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
	 * {@includeCode ../../examples/Chain/charMap/sketch.js}
	 */
	charMap(chars: string): this;

	/**
	 * Set the character foreground color using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/charColor/sketch.js}
	 */
	charColor(source: ISynthSource): this;
	/**
	 * Set the character foreground color using RGBA values.
	 *
	 * @param r - Red channel (0-1) or value
	 * @param g - Green channel (0-1) or value
	 * @param b - Blue channel (0-1) or value
	 * @param a - Alpha channel (0-1) or value
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/charColor2/sketch.js}
	 */
	charColor(
		r: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;
	/**
	 * Set the character foreground color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/charColor3/sketch.js}
	 */
	charColor(gray: SynthParameterValue): this;

	/**
	 * Set the cell background colors using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/cellColor/sketch.js}
	 */
	cellColor(source: ISynthSource): this;
	/**
	 * Set the cell background color using RGBA values.
	 *
	 * @param r - Red channel (0-1) or value
	 * @param g - Green channel (0-1) or value
	 * @param b - Blue channel (0-1) or value
	 * @param a - Alpha channel (0-1) or value
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/cellColor2/sketch.js}
	 */
	cellColor(
		r: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;
	/**
	 * Set the cell background color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/cellColor3/sketch.js}
	 */
	cellColor(gray: SynthParameterValue): this;

	/**
	 * Set the character indices using a character source chain.
	 * The number of characters is determined by `charMap()` if defined,
	 * otherwise falls back to the total characters in the layer's font.
	 *
	 * @param source A synth source producing character indices
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/char/sketch.js}
	 */
	char(source: ISynthSource): this;

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
	 * {@includeCode ../../examples/Chain/paint/sketch.js}
	 */
	paint(source: ISynthSource): this;
	/**
	 * Set both character foreground and cell background color using RGBA values.
	 *
	 * @param r - Red channel (0-1) or value
	 * @param g - Green channel (0-1) or value
	 * @param b - Blue channel (0-1) or value
	 * @param a - Alpha channel (0-1) or value
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/paint2/sketch.js}
	 */
	paint(
		r: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;
	/**
	 * Set both character foreground and cell background color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/paint3/sketch.js}
	 */
	paint(gray: SynthParameterValue): this;

	/**
	 * Create a deep clone of this SynthSource.
	 * Useful when you want to create a modified version of an existing chain
	 * without affecting the original.
	 *
	 * @returns A new SynthSource with the same transform chain
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/clone/sketch.js}
	 */
	clone(): ISynthSource;

	/**
	 * Generate oscillating patterns using sine waves.
	 * @param frequency - Frequency of the oscillation (default: 60.0)
	 * @param sync - Synchronization offset (default: 0.1)
	 * @param offset - Phase offset (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/osc/sketch.js}
	 */
	osc(
		frequency?: SynthParameterValue,
		sync?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Generate Perlin noise patterns.
	 * @param scale - Scale of the noise pattern (default: 10.0)
	 * @param speed - Animation speed (default: 0.1)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/noise/sketch.js}
	 */
	noise(scale?: SynthParameterValue, speed?: SynthParameterValue): this;

	/**
	 * Generate plasma-like sine field patterns.
	 * @param scale - Spatial scale of the plasma (default: 10.0)
	 * @param speed - Animation speed (default: 0.5)
	 * @param phase - Phase offset (default: 0.0)
	 * @param contrast - Contrast adjustment (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/plasma/sketch.js}
	 */
	plasma(
		scale?: SynthParameterValue,
		speed?: SynthParameterValue,
		phase?: SynthParameterValue,
		contrast?: SynthParameterValue
	): this;

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
	 * {@includeCode ../../examples/Sources/moire/sketch.js}
	 */
	moire(
		freqA?: SynthParameterValue,
		freqB?: SynthParameterValue,
		angleA?: SynthParameterValue,
		angleB?: SynthParameterValue,
		speed?: SynthParameterValue,
		phase?: SynthParameterValue
	): this;

	/**
	 * Generate voronoi patterns.
	 * @param scale - Scale of voronoi cells (default: 5.0)
	 * @param speed - Animation speed (default: 0.3)
	 * @param blending - Blending between cell regions (default: 0.3)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/voronoi/sketch.js}
	 */
	voronoi(
		scale?: SynthParameterValue,
		speed?: SynthParameterValue,
		blending?: SynthParameterValue
	): this;

	/**
	 * Generate a rotating radial gradient.
	 * @param speed - Rotation speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/gradient/sketch.js}
	 */
	gradient(speed?: SynthParameterValue): this;

	/**
	 * Generate geometric shapes (polygons).
	 * @param sides - Number of sides (default: 3)
	 * @param radius - Radius of the shape (default: 0.3)
	 * @param smoothing - Edge smoothing amount (default: 0.01)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/shape/sketch.js}
	 */
	shape(
		sides?: SynthParameterValue,
		radius?: SynthParameterValue,
		smoothing?: SynthParameterValue
	): this;

	/**
	 * Generate a solid grayscale color.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/solid/sketch.js}
	 */
	solid(gray: SynthParameterValue): this;
	/**
	 * Generate a solid color.
	 * @param r - Red channel (0-1, default: 0.0)
	 * @param g - Green channel (0-1, default: 0.0)
	 * @param b - Blue channel (0-1, default: 0.0)
	 * @param a - Alpha channel (0-1, default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Sources/solid2/sketch.js}
	 */
	solid(
		r?: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;

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
	 * {@includeCode ../../examples/Sources/src/sketch.js}
	 */
	src(layer?: TextmodeLayer): this;

	/**
	 * Rotate coordinates.
	 * @param angle - Rotation angle in radians (default: 10.0)
	 * @param speed - Rotation speed multiplier (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/rotate/sketch.js}
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
	 * {@includeCode ../../examples/Coordinates/scale/sketch.js}
	 */
	scale(
		amount?: SynthParameterValue,
		xMult?: SynthParameterValue,
		yMult?: SynthParameterValue,
		offsetX?: SynthParameterValue,
		offsetY?: SynthParameterValue
	): this;

	/**
	 * Scroll coordinates in both X and Y directions.
	 * @param scrollX - X scroll amount (default: 0.5)
	 * @param scrollY - Y scroll amount (default: 0.5)
	 * @param speedX - X scroll speed (default: 0.0)
	 * @param speedY - Y scroll speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/scroll/sketch.js}
	 */
	scroll(
		scrollX?: SynthParameterValue,
		scrollY?: SynthParameterValue,
		speedX?: SynthParameterValue,
		speedY?: SynthParameterValue
	): this;

	/**
	 * Scroll coordinates in X direction.
	 * @param scrollX - X scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/scrollX/sketch.js}
	 */
	scrollX(scrollX?: SynthParameterValue, speed?: SynthParameterValue): this;

	/**
	 * Scroll coordinates in Y direction.
	 * @param scrollY - Y scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/scrollY/sketch.js}
	 */
	scrollY(scrollY?: SynthParameterValue, speed?: SynthParameterValue): this;

	/**
	 * Pixelate the output.
	 * @param pixelX - Pixel size in X (default: 20.0)
	 * @param pixelY - Pixel size in Y (default: 20.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/pixelate/sketch.js}
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
	 * {@includeCode ../../examples/Coordinates/repeat/sketch.js}
	 */
	repeat(
		repeatX?: SynthParameterValue,
		repeatY?: SynthParameterValue,
		offsetX?: SynthParameterValue,
		offsetY?: SynthParameterValue
	): this;

	/**
	 * Repeat coordinates in X direction.
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset between repetitions (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/repeatX/sketch.js}
	 */
	repeatX(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

	/**
	 * Repeat coordinates in Y direction.
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset between repetitions (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/repeatY/sketch.js}
	 */
	repeatY(reps?: SynthParameterValue, offset?: SynthParameterValue): this;

	/**
	 * Apply kaleidoscope effect.
	 * @param nSides - Number of kaleidoscope sides (default: 4.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/kaleid/sketch.js}
	 */
	kaleid(nSides?: SynthParameterValue): this;

	/**
	 * Convert coordinates to polar space.
	 * @param angle - Angle offset in radians (default: 0.0)
	 * @param radius - Radius multiplier (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/polar/sketch.js}
	 */
	polar(angle?: SynthParameterValue, radius?: SynthParameterValue): this;

	/**
	 * Twirl distortion with radial falloff.
	 * @param amount - Twirl strength (default: 2.0)
	 * @param radius - Effect radius (default: 0.5)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/twirl/sketch.js}
	 */
	twirl(
		amount?: SynthParameterValue,
		radius?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Swirl distortion around a center.
	 * @param amount - Swirl strength (default: 4.0)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/swirl/sketch.js}
	 */
	swirl(
		amount?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Mirror coordinates across X and/or Y axes.
	 * @param mirrorX - Mirror X (0-1, default: 1.0)
	 * @param mirrorY - Mirror Y (0-1, default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/mirror/sketch.js}
	 */
	mirror(mirrorX?: SynthParameterValue, mirrorY?: SynthParameterValue): this;

	/**
	 * Shear coordinates along X and Y axes.
	 * @param x - X shear amount (default: 0.0)
	 * @param y - Y shear amount (default: 0.0)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/shear/sketch.js}
	 */
	shear(
		x?: SynthParameterValue,
		y?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Barrel distortion (bulge outward).
	 * @param amount - Distortion amount (default: 0.5)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/barrel/sketch.js}
	 */
	barrel(
		amount?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Pinch distortion (pull inward).
	 * @param amount - Distortion amount (default: 0.5)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/pinch/sketch.js}
	 */
	pinch(
		amount?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Fisheye lens distortion.
	 * @param amount - Distortion amount (default: 1.0)
	 * @param centerX - Center X (default: 0.5)
	 * @param centerY - Center Y (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Coordinates/fisheye/sketch.js}
	 */
	fisheye(
		amount?: SynthParameterValue,
		centerX?: SynthParameterValue,
		centerY?: SynthParameterValue
	): this;

	/**
	 * Adjust brightness.
	 * @param amount - Brightness adjustment amount (default: 0.4)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/brightness/sketch.js}
	 */
	brightness(amount?: SynthParameterValue): this;

	/**
	 * Adjust contrast.
	 * @param amount - Contrast amount (default: 1.6)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/contrast/sketch.js}
	 */
	contrast(amount?: SynthParameterValue): this;

	/**
	 * Invert colors.
	 * @param amount - Inversion amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/invert/sketch.js}
	 */
	invert(amount?: SynthParameterValue): this;

	/**
	 * Adjust color saturation.
	 * @param amount - Saturation amount (default: 2.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/saturate/sketch.js}
	 */
	saturate(amount?: SynthParameterValue): this;

	/**
	 * Shift hue.
	 * @param hue - Hue shift amount (default: 0.4)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/hue/sketch.js}
	 */
	hue(hue?: SynthParameterValue): this;

	/**
	 * Apply colorama effect (hue rotation based on luminance).
	 * @param amount - Effect amount (default: 0.005)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/colorama/sketch.js}
	 */
	colorama(amount?: SynthParameterValue): this;

	/**
	 * Posterize colors to limited palette.
	 * @param bins - Number of color bins (default: 3.0)
	 * @param gamma - Gamma correction (default: 0.6)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/posterize/sketch.js}
	 */
	posterize(bins?: SynthParameterValue, gamma?: SynthParameterValue): this;

	/**
	 * Apply threshold based on luminance.
	 * @param threshold - Threshold value (default: 0.5)
	 * @param tolerance - Tolerance range (default: 0.1)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/luma/sketch.js}
	 */
	luma(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this;

	/**
	 * Apply hard threshold.
	 * @param threshold - Threshold value (default: 0.5)
	 * @param tolerance - Tolerance range (default: 0.04)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/thresh/sketch.js}
	 */
	thresh(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this;

	/**
	 * Multiply all channels by a scalar value (grayscale).
	 * @param gray - Scalar multiplier
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/color/sketch.js}
	 */
	color(gray: SynthParameterValue): this;
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
	 * {@includeCode ../../examples/Colors/color2/sketch.js}
	 */
	color(
		r?: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;

	/**
	 * Extract the red channel as a grayscale value.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/r/sketch.js}
	 */
	r(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

	/**
	 * Extract the green channel as a grayscale value.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/g/sketch.js}
	 */
	g(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

	/**
	 * Extract the blue channel as a grayscale value.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/b/sketch.js}
	 */
	b(scale?: SynthParameterValue, offset?: SynthParameterValue): this;

	/**
	 * Shift color channels by adding offset values.
	 * @param r - Red channel shift (default: 0.5)
	 * @param g - Green channel shift (default: 0.0)
	 * @param b - Blue channel shift (default: 0.0)
	 * @param a - Alpha channel shift (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/shift/sketch.js}
	 */
	shift(
		r?: SynthParameterValue,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this;

	/**
	 * Apply gamma correction for nonlinear brightness control.
	 * @param amount - Gamma value (default: 1.0, < 1.0 brightens, > 1.0 darkens)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/gamma/sketch.js}
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
	 * {@includeCode ../../examples/Colors/levels/sketch.js}
	 */
	levels(
		inMin?: SynthParameterValue,
		inMax?: SynthParameterValue,
		outMin?: SynthParameterValue,
		outMax?: SynthParameterValue,
		gamma?: SynthParameterValue
	): this;

	/**
	 * Clamp color values to a specified range for stability.
	 * @param min - Minimum value (default: 0.0)
	 * @param max - Maximum value (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/clamp/sketch.js}
	 */
	clamp(min?: SynthParameterValue, max?: SynthParameterValue): this;

	/**
	 * Set a seed for deterministic randomness in this source chain.
	 *
	 * When set, noise-based functions (noise, voronoi) will produce
	 * reproducible patterns. Different seeds produce different patterns.
	 *
	 * @param value - Seed value (any number)
	 *
	 * @example
	 * {@includeCode ../../examples/Colors/seed/sketch.js}
	 */
	seed(value: SynthParameterValue): this;

	/**
	 * Add another source.
	 * @param source - Source to add
	 * @param amount - Blend amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/add/sketch.js}
	 */
	add(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Subtract another source.
	 * @param source - Source to subtract
	 * @param amount - Blend amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/sub/sketch.js}
	 */
	sub(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Multiply with another source.
	 * @param source - Source to multiply
	 * @param amount - Blend amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/mult/sketch.js}
	 */
	mult(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Blend with another source.
	 * @param source - Source to blend
	 * @param amount - Blend amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/blend/sketch.js}
	 */
	blend(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Difference with another source.
	 * @param source - Source to compare
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/diff/sketch.js}
	 */
	diff(source: ISynthSource | SynthParameterValue): this;

	/**
	 * Layer another source on top.
	 * @param source - Source to layer
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/layer/sketch.js}
	 */
	layer(source: ISynthSource | SynthParameterValue): this;

	/**
	 * Mask using another source.
	 * @param source - Source to use as mask
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/mask/sketch.js}
	 */
	mask(source: ISynthSource | SynthParameterValue): this;

	/**
	 * Screen blend with another source.
	 * @param source - Source to screen
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/screen/sketch.js}
	 */
	screen(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Overlay blend with another source.
	 * @param source - Source to overlay
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/overlay/sketch.js}
	 */
	overlay(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Soft light blend with another source.
	 * @param source - Source to softlight
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/softlight/sketch.js}
	 */
	softlight(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Hard light blend with another source.
	 * @param source - Source to hardlight
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/hardlight/sketch.js}
	 */
	hardlight(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Color dodge blend with another source.
	 * @param source - Source to dodge
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/dodge/sketch.js}
	 */
	dodge(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Color burn blend with another source.
	 * @param source - Source to burn
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/burn/sketch.js}
	 */
	burn(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Lighten blend with another source.
	 * @param source - Source to lighten
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/lighten/sketch.js}
	 */
	lighten(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Darken blend with another source.
	 * @param source - Source to darken
	 * @param amount - Blend amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Combines/darken/sketch.js}
	 */
	darken(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Modulate coordinates using another source.
	 * @param source - Modulation source
	 * @param amount - Modulation amount (default: 0.1)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulate/sketch.js}
	 */
	modulate(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	/**
	 * Modulate scale using another source.
	 * @param source - Modulation source
	 * @param multiple - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateScale/sketch.js}
	 */
	modulateScale(
		source: ISynthSource | SynthParameterValue,
		multiple?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Modulate rotation using another source.
	 * @param source - Modulation source
	 * @param multiple - Rotation multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateRotate/sketch.js}
	 */
	modulateRotate(
		source: ISynthSource | SynthParameterValue,
		multiple?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Modulate pixelation using another source.
	 * @param source - Modulation source
	 * @param multiple - Pixelation multiplier (default: 10.0)
	 * @param offset - Offset amount (default: 3.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulatePixelate/sketch.js}
	 */
	modulatePixelate(
		source: ISynthSource | SynthParameterValue,
		multiple?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Modulate kaleidoscope using another source.
	 * @param source - Modulation source
	 * @param nSides - Number of sides (default: 4.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateKaleid/sketch.js}
	 */
	modulateKaleid(source: ISynthSource | SynthParameterValue, nSides?: SynthParameterValue): this;

	/**
	 * Modulate X scroll using another source.
	 * @param source - Modulation source
	 * @param scrollX - X scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateScrollX/sketch.js}
	 */
	modulateScrollX(
		source: ISynthSource | SynthParameterValue,
		scrollX?: SynthParameterValue,
		speed?: SynthParameterValue
	): this;

	/**
	 * Modulate Y scroll using another source.
	 * @param source - Modulation source
	 * @param scrollY - Y scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateScrollY/sketch.js}
	 */
	modulateScrollY(
		source: ISynthSource | SynthParameterValue,
		scrollY?: SynthParameterValue,
		speed?: SynthParameterValue
	): this;

	/**
	 * Modulate repeat pattern with another source.
	 * @param source - Modulation source
	 * @param repeatX - X repetitions (default: 3.0)
	 * @param repeatY - Y repetitions (default: 3.0)
	 * @param offsetX - X offset (default: 0.5)
	 * @param offsetY - Y offset (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateRepeat/sketch.js}
	 */
	modulateRepeat(
		source: ISynthSource | SynthParameterValue,
		repeatX?: SynthParameterValue,
		repeatY?: SynthParameterValue,
		offsetX?: SynthParameterValue,
		offsetY?: SynthParameterValue
	): this;

	/**
	 * Modulate X repeat with another source.
	 * @param source - Modulation source
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateRepeatX/sketch.js}
	 */
	modulateRepeatX(
		source: ISynthSource | SynthParameterValue,
		reps?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Modulate Y repeat with another source.
	 * @param source - Modulation source
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset amount (default: 0.5)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateRepeatY/sketch.js}
	 */
	modulateRepeatY(
		source: ISynthSource | SynthParameterValue,
		reps?: SynthParameterValue,
		offset?: SynthParameterValue
	): this;

	/**
	 * Modulate coordinates based on hue differences.
	 * @param source - Modulation source
	 * @param amount - Modulation amount (default: 1.0)
	 *
	 * @example
	 * {@includeCode ../../examples/Modulations/modulateHue/sketch.js}
	 */
	modulateHue(source: ISynthSource | SynthParameterValue, amount?: SynthParameterValue): this;

	// ─────────────────────────────────────────────────────────────────────────
	// Internal methods (used by TransformFactory and declaration merging)
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Add a transform to the chain.
	 * @ignore
	 */
	addTransform(name: string, userArgs: SynthParameterValue[]): this;

	/**
	 * Add a combine transform that references another source.
	 * @ignore
	 */
	addCombineTransform(name: string, source: ISynthSource, userArgs: SynthParameterValue[]): this;

	/**
	 * Add an external layer reference at the current transform index.
	 * @ignore
	 */
	addExternalLayerRef(ref: ExternalLayerReference): this;
}
