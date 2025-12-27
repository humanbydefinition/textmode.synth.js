import type {
	SynthParameterValue,
	CharacterMapping,
} from './types';
import { createCharacterMapping } from './types';
import { SynthChain, type TransformRecord } from './SynthChain';

/**
 * Options for creating a new SynthSource.
 * @internal
 */
interface SynthSourceCreateOptions {
	chain?: SynthChain;
	charMapping?: CharacterMapping;
	colorSource?: SynthSource;
	cellColorSource?: SynthSource;
	nestedSources?: Map<number, SynthSource>;
}

/**
 * A chainable synthesis source that accumulates transforms to be compiled into a shader.
 * 
 * This is the core class that enables hydra-like method chaining for
 * generating procedural textmode visuals. Each method call adds a
 * transform to the chain, which is later compiled into a GLSL shader.
 * 
 * @example
 * ```ts
 * // Create a synth chain with procedural characters and colors
 * const chain = charNoise(10)
 *   .charMap('@#%*+=-:. ')
 *   .charRotate(0.1)
 *   .charColor(osc(5).kaleid(4))
 *   .scroll(0.1, 0);
 * ```
 */
export class SynthSource {
	/** The immutable chain of transforms */
	private readonly _chain: SynthChain;

	/** Character mapping for charMap transform */
	private _charMapping?: CharacterMapping;

	/** Nested sources for combine operations (indexed by transform position) */
	private readonly _nestedSources: Map<number, SynthSource>;

	/** Reference to the color source chain (if any) */
	private _colorSource?: SynthSource;

	/** Reference to the cell color source chain (if any) */
	private _cellColorSource?: SynthSource;

	/**
	 * Create a new SynthSource.
	 * @param options Optional initialization options
	 * @ignore Use generator functions like `osc()`, `noise()` instead
	 */
	constructor(options?: SynthSourceCreateOptions) {
		this._chain = options?.chain ?? SynthChain.empty();
		this._charMapping = options?.charMapping;
		this._colorSource = options?.colorSource;
		this._cellColorSource = options?.cellColorSource;
		this._nestedSources = options?.nestedSources ?? new Map();
	}

	// ============================================================
	// CORE CHAIN MANAGEMENT
	// ============================================================

	/**
	 * Add a transform to the chain.
	 * This method is called by dynamically injected transform methods.
	 * @ignore
	 */
	public addTransform(name: string, userArgs: SynthParameterValue[]): this {
		const record: TransformRecord = { name, userArgs };

		// Use the chain's internal mutation method for the fluent API
		this._chain.push(record);

		return this;
	}

	/**
	 * Add a combine transform that references another source.
	 * @ignore
	 */
	public addCombineTransform(name: string, source: SynthSource, userArgs: SynthParameterValue[]): this {
		const index = this._chain.length;
		this._nestedSources.set(index, source);
		return this.addTransform(name, userArgs);
	}

	// ============================================================
	// SPECIAL TEXTMODE METHODS (not dynamically generated)
	// ============================================================

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
	 * charNoise(10).charMap('@#%*+=-:. ')
	 *
	 * // Use block characters
	 * charOsc(8).charMap(' .:-=+*#%@')
	 *
	 * // Use custom symbols
	 * charGradient().charMap('-<>^v')
	 * ```
	 */
	public charMap(chars: string): this {
		this._charMapping = createCharacterMapping(chars);
		return this;
	}

	/**
	 * Set the character foreground color using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * ```ts
	 * // Use oscillator for rainbow colors
	 * charNoise(10).charColor(osc(5, 0.1))
	 *
	 * // Use solid color
	 * charNoise(10).charColor(solid(1, 0.5, 0))
	 *
	 * // Use gradient
	 * charNoise(10).charColor(gradient(0.5).hue(0.3))
	 * ```
	 */
	public charColor(source: SynthSource): this {
		this._colorSource = source;
		return this;
	}

	/**
	 * Set the cell background color using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * ```ts
	 * // Transparent background
	 * charNoise(10).cellColor(solid(0, 0, 0, 0))
	 *
	 * // Complement of character color
	 * charNoise(10).charColor(osc(5)).cellColor(osc(5).invert())
	 * ```
	 */
	public cellColor(source: SynthSource): this {
		this._cellColorSource = source;
		return this;
	}

	/**
	 * Set both character foreground and cell background color using the same source chain.
	 * This is a convenience method that combines `.charColor()` and `.cellColor()` in one call.
	 *
	 * After calling `paint()`, you can still override the cell color separately using `.cellColor()`.
	 *
	 * @param source A SynthSource producing color values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * ```ts
	 * // Apply same color to both character and cell background
	 * charNoise(10).paint(osc(5, 0.1).kaleid(4))
	 *
	 * // Apply color to both, then invert just the cell background
	 * charNoise(10)
	 *   .paint(voronoi(10, 0.5).mult(osc(20)))
	 *   .cellColor(voronoi(10, 0.5).mult(osc(20)).invert())
	 *
	 * // Equivalent to:
	 * // charNoise(10)
	 * //   .charColor(voronoi(10, 0.5).mult(osc(20)))
	 * //   .cellColor(voronoi(10, 0.5).mult(osc(20)))
	 * ```
	 */
	public paint(source: SynthSource): this {
		this._colorSource = source;
		this._cellColorSource = source;
		return this;
	}

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
	 * charNoise(10)
	 *   .paint(colorChain)
	 *   .cellColor(colorChain.clone().invert())
	 * 
	 * // Or use it to create variations of a base pattern
	 * const base = osc(10, 0.1);
	 * const rotated = base.clone().rotate(0.5);
	 * const scaled = base.clone().scale(2);
	 * ```
	 */
	public clone(): SynthSource {
		// Clone nested sources
		const clonedNestedSources = new Map<number, SynthSource>();
		for (const [key, value] of this._nestedSources) {
			clonedNestedSources.set(key, value.clone());
		}

		return new SynthSource({
			chain: SynthChain.from(this._chain.transforms),
			charMapping: this._charMapping,
			colorSource: this._colorSource?.clone(),
			cellColorSource: this._cellColorSource?.clone(),
			nestedSources: clonedNestedSources,
		});
	}

	// ============================================================
	// ACCESSORS (for compiler use)
	// ============================================================

	/**
	 * Get the transform records.
	 * @ignore
	 */
	public get transforms(): readonly TransformRecord[] {
		return this._chain.transforms;
	}

	/**
	 * Get the character mapping if defined.
	 * @ignore
	 */
	public get charMapping(): CharacterMapping | undefined {
		return this._charMapping;
	}

	/**
	 * Get the color source if defined.
	 * @ignore
	 */
	public get colorSource(): SynthSource | undefined {
		return this._colorSource;
	}

	/**
	 * Get the cell color source if defined.
	 * @ignore
	 */
	public get cellColorSource(): SynthSource | undefined {
		return this._cellColorSource;
	}

	/**
	 * Get all nested sources for combine operations.
	 * @ignore
	 */
	public get nestedSources(): Map<number, SynthSource> {
		return this._nestedSources;
	}

	// ============================================================
	// DYNAMICALLY INJECTED METHODS
	// The following methods are injected by TransformFactory.
	// They are declared here with JSDoc for TypeScript and documentation support.
	// ============================================================

	// Source generators
	/**
	 * Generate oscillating patterns using sine waves.
	 * @param frequency - Frequency of the oscillation (default: 60.0)
	 * @param sync - Synchronization offset (default: 0.1)
	 * @param offset - Phase offset (default: 0.0)
	 */
	declare public osc: (frequency?: SynthParameterValue, sync?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Generate Perlin noise patterns.
	 * @param scale - Scale of the noise pattern (default: 10.0)
	 * @param speed - Animation speed (default: 0.1)
	 */
	declare public noise: (scale?: SynthParameterValue, speed?: SynthParameterValue) => this;

	/**
	 * Generate Voronoi (cellular) patterns.
	 * @param scale - Scale of Voronoi cells (default: 5.0)
	 * @param speed - Animation speed (default: 0.3)
	 * @param blending - Blending between cell regions (default: 0.3)
	 */
	declare public voronoi: (scale?: SynthParameterValue, speed?: SynthParameterValue, blending?: SynthParameterValue) => this;

	/**
	 * Generate a rotating radial gradient.
	 * @param speed - Rotation speed (default: 0.0)
	 */
	declare public gradient: (speed?: SynthParameterValue) => this;

	/**
	 * Generate geometric shapes (polygons).
	 * @param sides - Number of sides (default: 3)
	 * @param radius - Radius of the shape (default: 0.3)
	 * @param smoothing - Edge smoothing amount (default: 0.01)
	 */
	declare public shape: (sides?: SynthParameterValue, radius?: SynthParameterValue, smoothing?: SynthParameterValue) => this;

	/**
	 * Generate a solid color.
	 * @param r - Red channel (0-1, default: 0.0)
	 * @param g - Green channel (0-1, default: 0.0)
	 * @param b - Blue channel (0-1, default: 0.0)
	 * @param a - Alpha channel (0-1, default: 1.0)
	 */
	declare public solid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;

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
	declare public src: () => this;

	/**
	 * Sample the previous frame's primary color output for feedback effects.
	 * @deprecated Use src() instead for hydra compatibility
	 * 
	 * @example
	 * ```typescript
	 * // Classic feedback loop with noise modulation
	 * prev().modulate(noise(3), 0.005).blend(shape(4), 0.01)
	 * 
	 * // Trailing effect with scaling
	 * prev().scale(1.01).blend(charNoise(10), 0.1)
	 * ```
	 */
	declare public prev: () => this;

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
	declare public charSrc: () => this;

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
	declare public cellColorSrc: () => this;

	// Coordinate transforms
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
	declare public rotate: (angle?: SynthParameterValue, speed?: SynthParameterValue) => this;

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
	declare public scale: (amount?: SynthParameterValue, xMult?: SynthParameterValue, yMult?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => this;

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
	declare public scroll: (scrollX?: SynthParameterValue, scrollY?: SynthParameterValue, speedX?: SynthParameterValue, speedY?: SynthParameterValue) => this;

	/**
	 * Scroll coordinates in X direction.
	 * @param scrollX - X scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 */
	declare public scrollX: (scrollX?: SynthParameterValue, speed?: SynthParameterValue) => this;

	/**
	 * Scroll coordinates in Y direction.
	 * @param scrollY - Y scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 */
	declare public scrollY: (scrollY?: SynthParameterValue, speed?: SynthParameterValue) => this;

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
	declare public pixelate: (pixelX?: SynthParameterValue, pixelY?: SynthParameterValue) => this;

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
	declare public repeat: (repeatX?: SynthParameterValue, repeatY?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => this;

	/**
	 * Repeat coordinates in X direction.
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset between repetitions (default: 0.0)
	 */
	declare public repeatX: (reps?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Repeat coordinates in Y direction.
	 * @param reps - Number of repetitions (default: 3.0)
	 * @param offset - Offset between repetitions (default: 0.0)
	 */
	declare public repeatY: (reps?: SynthParameterValue, offset?: SynthParameterValue) => this;

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
	declare public kaleid: (nSides?: SynthParameterValue) => this;

	// Color transforms
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
	declare public brightness: (amount?: SynthParameterValue) => this;

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
	declare public contrast: (amount?: SynthParameterValue) => this;

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
	declare public invert: (amount?: SynthParameterValue) => this;

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
	declare public saturate: (amount?: SynthParameterValue) => this;

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
	declare public hue: (hue?: SynthParameterValue) => this;

	/**
	 * Apply colorama effect (hue rotation based on luminance).
	 * @param amount - Effect amount (default: 0.005)
	 */
	declare public colorama: (amount?: SynthParameterValue) => this;

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
	declare public posterize: (bins?: SynthParameterValue, gamma?: SynthParameterValue) => this;

	/**
	 * Apply threshold based on luminance.
	 * @param threshold - Threshold value (default: 0.5)
	 * @param tolerance - Tolerance range (default: 0.1)
	 */
	declare public luma: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => this;

	/**
	 * Apply hard threshold.
	 * @param threshold - Threshold value (default: 0.5)
	 * @param tolerance - Tolerance range (default: 0.04)
	 */
	declare public thresh: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => this;

	/**
	 * Set color channels.
	 * @param r - Red channel (default: 1.0)
	 * @param g - Green channel (default: 1.0)
	 * @param b - Blue channel (default: 1.0)
	 * @param a - Alpha channel (default: 1.0)
	 */
	declare public color: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;

	/**
	 * Scale and offset red channel.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 */
	declare public r: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Scale and offset green channel.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 */
	declare public g: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Scale and offset blue channel.
	 * @param scale - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 */
	declare public b: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;

	// Combine operations
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
	declare public add: (source: SynthSource, amount?: SynthParameterValue) => this;

	/**
	 * Subtract another source.
	 * @param source - Source to subtract
	 * @param amount - Blend amount (default: 0.5)
	 */
	declare public sub: (source: SynthSource, amount?: SynthParameterValue) => this;

	/**
	 * Multiply with another source.
	 * @param source - Source to multiply
	 * @param amount - Blend amount (default: 0.5)
	 */
	declare public mult: (source: SynthSource, amount?: SynthParameterValue) => this;

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
	declare public blend: (source: SynthSource, amount?: SynthParameterValue) => this;

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
	declare public diff: (source: SynthSource) => this;

	/**
	 * Layer another source on top.
	 * @param source - Source to layer
	 */
	declare public layer: (source: SynthSource) => this;

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
	declare public mask: (source: SynthSource) => this;

	// Modulation (combineCoord)
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
	declare public modulate: (source: SynthSource, amount?: SynthParameterValue) => this;

	/**
	 * Modulate scale using another source.
	 * @param source - Modulation source
	 * @param multiple - Scale multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 1.0)
	 */
	declare public modulateScale: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Modulate rotation using another source.
	 * @param source - Modulation source
	 * @param multiple - Rotation multiplier (default: 1.0)
	 * @param offset - Offset amount (default: 0.0)
	 */
	declare public modulateRotate: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Modulate pixelation using another source.
	 * @param source - Modulation source
	 * @param multiple - Pixelation multiplier (default: 10.0)
	 * @param offset - Offset amount (default: 3.0)
	 */
	declare public modulatePixelate: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;

	/**
	 * Modulate kaleidoscope using another source.
	 * @param source - Modulation source
	 * @param nSides - Number of sides (default: 4.0)
	 */
	declare public modulateKaleid: (source: SynthSource, nSides?: SynthParameterValue) => this;

	/**
	 * Modulate X scroll using another source.
	 * @param source - Modulation source
	 * @param scrollX - X scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 */
	declare public modulateScrollX: (source: SynthSource, scrollX?: SynthParameterValue, speed?: SynthParameterValue) => this;

	/**
	 * Modulate Y scroll using another source.
	 * @param source - Modulation source
	 * @param scrollY - Y scroll amount (default: 0.5)
	 * @param speed - Scroll speed (default: 0.0)
	 */
	declare public modulateScrollY: (source: SynthSource, scrollY?: SynthParameterValue, speed?: SynthParameterValue) => this;

	// Character generators
	/**
	 * Generate character indices using Perlin noise.
	 * @param scale - Scale of the noise pattern (default: 10.0)
	 * @param speed - Animation speed (default: 0.1)
	 * @param charCount - Number of different characters to use (default: 256)
	 */
	declare public charNoise: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => this;

	/**
	 * Generate character indices using oscillating sine waves.
	 * @param frequency - Frequency of the oscillation (default: 60.0)
	 * @param sync - Synchronization offset (default: 0.1)
	 * @param charCount - Number of different characters to use (default: 256)
	 */
	declare public charOsc: (frequency?: SynthParameterValue, sync?: SynthParameterValue, charCount?: SynthParameterValue) => this;

	/**
	 * Generate character indices using a gradient.
	 * @param charCount - Number of different characters to use (default: 256)
	 * @param direction - Gradient direction (default: 0.0)
	 */
	declare public charGradient: (charCount?: SynthParameterValue, direction?: SynthParameterValue) => this;

	/**
	 * Generate character indices using Voronoi (cellular) patterns.
	 * @param scale - Scale of Voronoi cells (default: 5.0)
	 * @param speed - Animation speed (default: 0.3)
	 * @param charCount - Number of different characters to use (default: 256)
	 */
	declare public charVoronoi: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => this;

	/**
	 * Generate character indices based on geometric shapes (polygons).
	 * @param sides - Number of sides (default: 3)
	 * @param innerChar - Character index for inside the shape (default: 0)
	 * @param outerChar - Character index for outside the shape (default: 1)
	 * @param radius - Radius of the shape (default: 0.3)
	 */
	declare public charShape: (sides?: SynthParameterValue, innerChar?: SynthParameterValue, outerChar?: SynthParameterValue, radius?: SynthParameterValue) => this;

	/**
	 * Generate a solid character index across the entire canvas.
	 * @param charIndex - Character index to use (default: 0)
	 */
	declare public charSolid: (charIndex?: SynthParameterValue) => this;

	// Character modifiers
	/**
	 * Flip characters horizontally.
	 * @param toggle - Toggle flip (default: 1.0)
	 */
	declare public charFlipX: (toggle?: SynthParameterValue) => this;

	/**
	 * Flip characters vertically.
	 * @param toggle - Toggle flip (default: 1.0)
	 */
	declare public charFlipY: (toggle?: SynthParameterValue) => this;

	/**
	 * Invert character indices.
	 * @param toggle - Toggle invert (default: 1.0)
	 */
	declare public charInvert: (toggle?: SynthParameterValue) => this;

	/**
	 * Rotate characters.
	 * @param angle - Rotation angle in radians (default: 0.0)
	 * @param speed - Rotation speed (default: 0.0)
	 */
	declare public charRotate: (angle?: SynthParameterValue, speed?: SynthParameterValue) => this;

	/**
	 * Rotate characters based on underlying value.
	 * @param amount - Rotation amount multiplier (default: 1.0)
	 */
	declare public charRotateFrom: (amount?: SynthParameterValue) => this;

	// Character colors
	/**
	 * Set solid character color.
	 * @param r - Red channel (default: 1.0)
	 * @param g - Green channel (default: 1.0)
	 * @param b - Blue channel (default: 1.0)
	 * @param a - Alpha channel (default: 1.0)
	 */
	declare public charColorSolid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;

	/**
	 * Generate character color from character index.
	 * @param hueOffset - Hue offset (default: 0.0)
	 * @param saturation - Saturation (default: 1.0)
	 * @param brightness - Brightness (default: 1.0)
	 */
	declare public charColorFromIndex: (hueOffset?: SynthParameterValue, saturation?: SynthParameterValue, brightness?: SynthParameterValue) => this;

	/**
	 * Generate character color using a gradient.
	 * @param speed - Gradient animation speed (default: 0.0)
	 */
	declare public charColorGradient: (speed?: SynthParameterValue) => this;

	// Cell colors
	/**
	 * Set solid cell background color.
	 * @param r - Red channel (default: 0.0)
	 * @param g - Green channel (default: 0.0)
	 * @param b - Blue channel (default: 0.0)
	 * @param a - Alpha channel (default: 0.0)
	 */
	declare public cellColorSolid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;

	/**
	 * Set cell color as complement of character color.
	 * @param amount - Effect amount (default: 1.0)
	 */
	declare public cellColorComplement: (amount?: SynthParameterValue) => this;

	/**
	 * Generate cell color from character.
	 * @param hueShift - Hue shift amount (default: 0.5)
	 * @param saturation - Saturation (default: 1.0)
	 * @param brightness - Brightness (default: 0.5)
	 */
	declare public cellColorFromChar: (hueShift?: SynthParameterValue, saturation?: SynthParameterValue, brightness?: SynthParameterValue) => this;
}
