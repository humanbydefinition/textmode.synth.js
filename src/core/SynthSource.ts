/**
 * SynthSource - The chainable synthesis source class.
 *
 * This is the core class that enables hydra-like method chaining for
 * generating procedural textmode visuals. Each method call adds a
 * transform to the chain, which is later compiled into a GLSL shader.
 * 
 * Transform methods are dynamically injected by the TransformFactory
 * based on registered transform definitions, eliminating boilerplate.
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

import type { 
	SynthParameterValue, 
	CharacterMapping, 
	ISynthSource,
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
 */
export class SynthSource implements ISynthSource {
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
	 * @internal Use generator functions like `osc()`, `noise()` instead
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
	 * @internal
	 */
	public _addTransform(name: string, userArgs: SynthParameterValue[]): this {
		const record: TransformRecord = { name, userArgs };
		
		// Use the chain's internal mutation method for the fluent API
		this._chain.$push(record);

		return this;
	}

	/**
	 * Add a combine transform that references another source.
	 * @internal
	 */
	public _addCombineTransform(name: string, source: SynthSource, userArgs: SynthParameterValue[]): this {
		const index = this._chain.length;
		this._nestedSources.set(index, source);
		return this._addTransform(name, userArgs);
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
	 * charOsc(8).charMap('█▓▒░ ')
	 *
	 * // Use custom symbols
	 * charGradient().charMap('◆◇○●□■')
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
	public charColor(source: SynthSource): this;
	public charColor(r: number, g: number, b: number, a?: number): this;
	public charColor(sourceOrR: SynthSource | number, g?: number, b?: number, a?: number): this {
		if (sourceOrR instanceof SynthSource) {
			this._colorSource = sourceOrR;
		} else {
			// Create a solid color source - we need to dynamically import to avoid circular deps
			// For now, create a simple source with the solid transform
			const solidSource = new SynthSource();
			solidSource._addTransform('solid', [sourceOrR, g ?? 0, b ?? 0, a ?? 1]);
			this._colorSource = solidSource;
		}
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
	public cellColor(source: SynthSource): this;
	public cellColor(r: number, g: number, b: number, a?: number): this;
	public cellColor(sourceOrR: SynthSource | number, g?: number, b?: number, a?: number): this {
		if (sourceOrR instanceof SynthSource) {
			this._cellColorSource = sourceOrR;
		} else {
			const solidSource = new SynthSource();
			solidSource._addTransform('solid', [sourceOrR, g ?? 0, b ?? 0, a ?? 1]);
			this._cellColorSource = solidSource;
		}
		return this;
	}

	// ============================================================
	// ACCESSORS (for compiler use)
	// ============================================================

	/**
	 * Get the transform records.
	 * @internal
	 */
	public get transforms(): readonly TransformRecord[] {
		return this._chain.transforms;
	}

	/**
	 * Get the character mapping if defined.
	 * @internal
	 */
	public get charMapping(): CharacterMapping | undefined {
		return this._charMapping;
	}

	/**
	 * Get the color source if defined.
	 * @internal
	 */
	public get colorSource(): SynthSource | undefined {
		return this._colorSource;
	}

	/**
	 * Get the cell color source if defined.
	 * @internal
	 */
	public get cellColorSource(): SynthSource | undefined {
		return this._cellColorSource;
	}

	/**
	 * Get all nested sources for combine operations.
	 * @internal
	 */
	public get nestedSources(): Map<number, SynthSource> {
		return this._nestedSources;
	}

	// ============================================================
	// DYNAMICALLY INJECTED METHODS
	// The following methods are injected by TransformFactory:
	// 
	// Sources: osc, noise, voronoi, gradient, shape, solid
	// Coords: rotate, scale, scroll, scrollX, scrollY, pixelate, repeat, repeatX, repeatY, kaleid
	// Colors: brightness, contrast, invert, saturate, hue, colorama, posterize, luma, thresh, color, r, g, b
	// Combine: add, sub, mult, blend, diff, layer, mask
	// CombineCoord: modulate, modulateScale, modulateRotate, modulatePixelate, modulateKaleid, modulateScrollX, modulateScrollY
	// Char: charNoise, charOsc, charGradient, charVoronoi, charShape, charSolid
	// CharModify: charFlipX, charFlipY, charInvert, charRotate, charRotateFrom
	// CharColor: charColorSolid, charColorFromIndex, charColorGradient
	// CellColor: cellColorSolid, cellColorComplement, cellColorFromChar
	// ============================================================

	// Type declarations for dynamically injected methods
	// This provides TypeScript support without manual implementation

	// Source generators
	declare public osc: (frequency?: SynthParameterValue, sync?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public noise: (scale?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public voronoi: (scale?: SynthParameterValue, speed?: SynthParameterValue, blending?: SynthParameterValue) => this;
	declare public gradient: (speed?: SynthParameterValue) => this;
	declare public shape: (sides?: SynthParameterValue, radius?: SynthParameterValue, smoothing?: SynthParameterValue) => this;
	declare public solid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;

	// Coordinate transforms
	declare public rotate: (angle?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public scale: (amount?: SynthParameterValue, xMult?: SynthParameterValue, yMult?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => this;
	declare public scroll: (scrollX?: SynthParameterValue, scrollY?: SynthParameterValue, speedX?: SynthParameterValue, speedY?: SynthParameterValue) => this;
	declare public scrollX: (scrollX?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public scrollY: (scrollY?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public pixelate: (pixelX?: SynthParameterValue, pixelY?: SynthParameterValue) => this;
	declare public repeat: (repeatX?: SynthParameterValue, repeatY?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue) => this;
	declare public repeatX: (reps?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public repeatY: (reps?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public kaleid: (nSides?: SynthParameterValue) => this;

	// Color transforms
	declare public brightness: (amount?: SynthParameterValue) => this;
	declare public contrast: (amount?: SynthParameterValue) => this;
	declare public invert: (amount?: SynthParameterValue) => this;
	declare public saturate: (amount?: SynthParameterValue) => this;
	declare public hue: (hue?: SynthParameterValue) => this;
	declare public colorama: (amount?: SynthParameterValue) => this;
	declare public posterize: (bins?: SynthParameterValue, gamma?: SynthParameterValue) => this;
	declare public luma: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => this;
	declare public thresh: (threshold?: SynthParameterValue, tolerance?: SynthParameterValue) => this;
	declare public color: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;
	declare public r: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public g: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public b: (scale?: SynthParameterValue, offset?: SynthParameterValue) => this;

	// Combine operations
	declare public add: (source: SynthSource, amount?: SynthParameterValue) => this;
	declare public sub: (source: SynthSource, amount?: SynthParameterValue) => this;
	declare public mult: (source: SynthSource, amount?: SynthParameterValue) => this;
	declare public blend: (source: SynthSource, amount?: SynthParameterValue) => this;
	declare public diff: (source: SynthSource) => this;
	declare public layer: (source: SynthSource) => this;
	declare public mask: (source: SynthSource) => this;

	// Modulation (combineCoord)
	declare public modulate: (source: SynthSource, amount?: SynthParameterValue) => this;
	declare public modulateScale: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public modulateRotate: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public modulatePixelate: (source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue) => this;
	declare public modulateKaleid: (source: SynthSource, nSides?: SynthParameterValue) => this;
	declare public modulateScrollX: (source: SynthSource, scrollX?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public modulateScrollY: (source: SynthSource, scrollY?: SynthParameterValue, speed?: SynthParameterValue) => this;

	// Character generators
	declare public charNoise: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => this;
	declare public charOsc: (frequency?: SynthParameterValue, sync?: SynthParameterValue, charCount?: SynthParameterValue) => this;
	declare public charGradient: (charCount?: SynthParameterValue, direction?: SynthParameterValue) => this;
	declare public charVoronoi: (scale?: SynthParameterValue, speed?: SynthParameterValue, charCount?: SynthParameterValue) => this;
	declare public charShape: (sides?: SynthParameterValue, innerChar?: SynthParameterValue, outerChar?: SynthParameterValue, radius?: SynthParameterValue) => this;
	declare public charSolid: (charIndex?: SynthParameterValue) => this;

	// Character modifiers
	declare public charFlipX: (toggle?: SynthParameterValue) => this;
	declare public charFlipY: (toggle?: SynthParameterValue) => this;
	declare public charInvert: (toggle?: SynthParameterValue) => this;
	declare public charRotate: (angle?: SynthParameterValue, speed?: SynthParameterValue) => this;
	declare public charRotateFrom: (amount?: SynthParameterValue) => this;

	// Character colors
	declare public charColorSolid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;
	declare public charColorFromIndex: (hueOffset?: SynthParameterValue, saturation?: SynthParameterValue, brightness?: SynthParameterValue) => this;
	declare public charColorGradient: (speed?: SynthParameterValue) => this;

	// Cell colors
	declare public cellColorSolid: (r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue) => this;
	declare public cellColorComplement: (amount?: SynthParameterValue) => this;
	declare public cellColorFromChar: (hueShift?: SynthParameterValue, saturation?: SynthParameterValue, brightness?: SynthParameterValue) => this;
}
