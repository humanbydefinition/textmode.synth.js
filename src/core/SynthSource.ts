import type { SynthParameterValue, CharacterMapping, ExternalLayerReference, TextmodeSourceReference } from './types';
import { SynthChain, type TransformRecord } from './SynthChain';

/**
 * Options for creating a new SynthSource.
 */
export interface SynthSourceCreateOptions {
	chain?: SynthChain;
	charMapping?: CharacterMapping;
	charColorSource?: SynthSource;
	cellColorSource?: SynthSource;
	charSource?: SynthSource;
	nestedSources?: Map<number, SynthSource>;
	externalLayerRefs?: Map<number, ExternalLayerReference>;
	textmodeSourceRefs?: Map<number, TextmodeSourceReference>;
}

/**
 * A chainable synthesis source that accumulates transforms to be compiled into a shader.
 *
 * This is the core class that enables hydra-like method chaining for
 * generating procedural textmode visuals. Each method call adds a
 * transform to the chain, which is later compiled into a GLSL shader.
 *
 * @example
 * ```javascript
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * const synth = noise(10)
 *   .rotate(0.2)
 *   .scroll(0.1, 0)
 *   .charColor(osc(5, 0.1, 1.2).kaleid(4))
 *   .cellColor(osc(5, 0.1, 1.2).kaleid(4).invert())
 *   .charMap('@#%*+=-:. ');
 *
 * t.layers.base.synth(synth);
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 */
export class SynthSource {
	/** The immutable chain of transforms */
	private readonly _chain: SynthChain;

	/** Character mapping for charMap transform */
	private _charMapping?: CharacterMapping;

	/** Nested sources for combine operations (indexed by transform position) */
	private readonly _nestedSources: Map<number, SynthSource>;

	/** External layer references for cross-layer sampling (indexed by transform position) */
	private readonly _externalLayerRefs: Map<number, ExternalLayerReference>;

	/** Reference to the color source chain (if any) */
	private _charColorSource?: SynthSource;

	/** Reference to the cell color source chain (if any) */
	private _cellColorSource?: SynthSource;

	/** Reference to the character source chain (if any) - used by char() function */
	private _charSource?: SynthSource;

	/** TextmodeSource references for image/video sampling (indexed by transform position) */
	private readonly _textmodeSourceRefs: Map<number, TextmodeSourceReference>;

	/**
	 * Create a new SynthSource.
	 * @param options Optional initialization options
	 * @ignore Use generator functions like `osc()`, `noise()` instead
	 */
	constructor(options?: SynthSourceCreateOptions) {
		this._chain = options?.chain ?? SynthChain.empty();
		this._charMapping = options?.charMapping;
		this._charColorSource = options?.charColorSource;
		this._cellColorSource = options?.cellColorSource;
		this._charSource = options?.charSource;
		this._nestedSources = options?.nestedSources ?? new Map();
		this._externalLayerRefs = options?.externalLayerRefs ?? new Map();
		this._textmodeSourceRefs = options?.textmodeSourceRefs ?? new Map();
	}

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

	/**
	 * Add an external layer reference at the current transform index.
	 * Used by src(layer) to track cross-layer sampling.
	 * @ignore
	 */
	public addExternalLayerRef(ref: ExternalLayerReference): this {
		const index = this._chain.length;
		this._externalLayerRefs.set(index, ref);
		return this.addTransform('src', []);
	}

	/**
	 * Add a TextmodeSource reference at the current transform index.
	 * Used by src(textmodeSource) to track image/video sampling.
	 * @ignore
	 */
	public addTextmodeSourceRef(ref: TextmodeSourceReference): this {
		const index = this._chain.length;
		this._textmodeSourceRefs.set(index, ref);
		return this.addTransform('srcTexture', []);
	}

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
	public charMap(chars: string): this {
		if (chars.length === 0) {
			this._charMapping = undefined;
			return this;
		}

		const charArray = Array.from(chars);
		const indices: number[] = [];

		for (const char of charArray) {
			indices.push(char.codePointAt(0) ?? 32);
		}

		this._charMapping = { chars, indices };

		return this;
	}

	private _ensureSource(
		rOrSource: SynthParameterValue | SynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): SynthSource {
		if (rOrSource instanceof SynthSource) {
			return rOrSource;
		}
		const source = new SynthSource();
		// If only a single number is provided, replicate it to RGB for grayscale consistency
		const args =
			typeof rOrSource === 'number' && g === undefined && b === undefined && a === undefined
				? [rOrSource, rOrSource, rOrSource, null]
				: [rOrSource, g, b, a].map((v) => (v === undefined ? null : v));
		source.addTransform('solid', args as SynthParameterValue[]);
		return source;
	}

	/**
	 * Set the character foreground color using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/charColor/sketch.js}
	 */
	charColor(source: SynthSource): this;
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
	charColor(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set the character foreground color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/charColor3/sketch.js}
	 */
	charColor(gray: SynthParameterValue): this;
	public charColor(
		rOrSource: SynthParameterValue | SynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		this._charColorSource = this._ensureSource(rOrSource, g, b, a);
		return this;
	}

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
	public char(source: SynthSource): this {
		this._charSource = source;
		return this;
	}

	/**
	 * Set the cell background colors using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/cellColor/sketch.js}
	 */
	cellColor(source: SynthSource): this;
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
	cellColor(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set the cell background color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/cellColor3/sketch.js}
	 */
	cellColor(gray: SynthParameterValue): this;
	public cellColor(
		rOrSource: SynthParameterValue | SynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		this._cellColorSource = this._ensureSource(rOrSource, g, b, a);
		return this;
	}

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
	paint(source: SynthSource): this;
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
	paint(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set both character foreground and cell background color using a grayscale value.
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/Chain/paint3/sketch.js}
	 */
	paint(gray: SynthParameterValue): this;
	public paint(
		rOrSource: SynthParameterValue | SynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		const source = this._ensureSource(rOrSource, g, b, a);
		this._charColorSource = source;
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
	 * {@includeCode ../../examples/Chain/clone/sketch.js}
	 */
	public clone(): SynthSource {
		// Clone nested sources
		const clonedNestedSources = new Map<number, SynthSource>();
		for (const [key, value] of this._nestedSources) {
			clonedNestedSources.set(key, value.clone());
		}

		// Clone external layer refs (shallow copy - layers are references)
		const clonedExternalLayerRefs = new Map<number, ExternalLayerReference>();
		for (const [key, value] of this._externalLayerRefs) {
			clonedExternalLayerRefs.set(key, { ...value });
		}

		// Clone textmode source refs (shallow copy - sources are references)
		const clonedTextmodeSourceRefs = new Map<number, TextmodeSourceReference>();
		for (const [key, value] of this._textmodeSourceRefs) {
			clonedTextmodeSourceRefs.set(key, { ...value });
		}

		return new SynthSource({
			chain: SynthChain.from(this._chain.transforms),
			charMapping: this._charMapping,
			charColorSource: this._charColorSource?.clone(),
			cellColorSource: this._cellColorSource?.clone(),
			charSource: this._charSource?.clone(),
			nestedSources: clonedNestedSources,
			externalLayerRefs: clonedExternalLayerRefs,
			textmodeSourceRefs: clonedTextmodeSourceRefs,
		});
	}

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
	public get charColorSource(): SynthSource | undefined {
		return this._charColorSource;
	}

	/**
	 * Get the cell color source if defined.
	 * @ignore
	 */
	public get cellColorSource(): SynthSource | undefined {
		return this._cellColorSource;
	}

	/**
	 * Get the character source if defined (from char() function).
	 * @ignore
	 */
	public get charSource(): SynthSource | undefined {
		return this._charSource;
	}

	/**
	 * Get all nested sources for combine operations.
	 * @ignore
	 */
	public get nestedSources(): Map<number, SynthSource> {
		return this._nestedSources;
	}

	/**
	 * Get all external layer references for cross-layer sampling.
	 * @ignore
	 */
	public get externalLayerRefs(): Map<number, ExternalLayerReference> {
		return this._externalLayerRefs;
	}

	/**
	 * Get all TextmodeSource references for image/video sampling.
	 * @ignore
	 */
	public get textmodeSourceRefs(): Map<number, TextmodeSourceReference> {
		return this._textmodeSourceRefs;
	}
}
