import type {
	SynthParameterValue,
	CharacterMapping,
	ExternalLayerReference,
} from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import type { ISynthSource } from './ISynthSource';

/**
 * Options for creating a new SynthSource.
 * @internal
 */
interface SynthSourceCreateOptions {
	chain?: SynthChain;
	charMapping?: CharacterMapping;
	colorSource?: SynthSource;
	cellColorSource?: SynthSource;
	charSource?: SynthSource;
	charCount?: number;
	nestedSources?: Map<number, SynthSource>;
	externalLayerRefs?: Map<number, ExternalLayerReference>;
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
 * const synth = noise(10)
 *   .rotate(0.1)
 *   .scroll(0.1, 0)
 *
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(osc(5).kaleid(4).invert())
 *
 *   .charMap('@#%*+=-:. ');
 * ```
 */
export class SynthSource implements ISynthSource {
	/** The immutable chain of transforms */
	private readonly _chain: SynthChain;

	/** Character mapping for charMap transform */
	private _charMapping?: CharacterMapping;

	/** Nested sources for combine operations (indexed by transform position) */
	private readonly _nestedSources: Map<number, SynthSource>;

	/** External layer references for cross-layer sampling (indexed by transform position) */
	private readonly _externalLayerRefs: Map<number, ExternalLayerReference>;

	/** Reference to the color source chain (if any) */
	private _colorSource?: SynthSource;

	/** Reference to the cell color source chain (if any) */
	private _cellColorSource?: SynthSource;

	/** Reference to the character source chain (if any) - used by char() function */
	private _charSource?: SynthSource;

	/** Number of unique characters when using char() function */
	private _charCount?: number;

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
		this._charSource = options?.charSource;
		this._charCount = options?.charCount;
		this._nestedSources = options?.nestedSources ?? new Map();
		this._externalLayerRefs = options?.externalLayerRefs ?? new Map();
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

	// ============================================================
	// SPECIAL TEXTMODE METHODS
	// ============================================================

	public charMap(chars: string): this {
		const charArray = Array.from(chars);
		const indices: number[] = [];

		for (const char of charArray) {
			indices.push(char.codePointAt(0) ?? 32);
		}

		this._charMapping = { chars, indices };

		return this;
	}

	public charColor(source: SynthSource): this {
		this._colorSource = source;
		return this;
	}

	public char(source: SynthSource, charCount: number): this {
		this._charSource = source;
		this._charCount = charCount;
		return this;
	}

	public cellColor(source: SynthSource): this {
		this._cellColorSource = source;
		return this;
	}

	public paint(source: SynthSource): this {
		this._colorSource = source;
		this._cellColorSource = source;
		return this;
	}

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

		return new SynthSource({
			chain: SynthChain.from(this._chain.transforms),
			charMapping: this._charMapping,
			colorSource: this._colorSource?.clone(),
			cellColorSource: this._cellColorSource?.clone(),
			charSource: this._charSource?.clone(),
			charCount: this._charCount,
			nestedSources: clonedNestedSources,
			externalLayerRefs: clonedExternalLayerRefs,
		});
	}

	// ============================================================
	// SOURCE GENERATORS
	// ============================================================

	public osc(frequency?: SynthParameterValue, sync?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('osc', [frequency ?? 60.0, sync ?? 0.1, offset ?? 0.0]);
	}

	public noise(scale?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addTransform('noise', [scale ?? 10.0, speed ?? 0.1]);
	}

	public voronoi(scale?: SynthParameterValue, speed?: SynthParameterValue, blending?: SynthParameterValue): this {
		return this.addTransform('voronoi', [scale ?? 5.0, speed ?? 0.3, blending ?? 0.3]);
	}

	public gradient(speed?: SynthParameterValue): this {
		return this.addTransform('gradient', [speed ?? 0.0]);
	}

	public shape(sides?: SynthParameterValue, radius?: SynthParameterValue, smoothing?: SynthParameterValue): this {
		return this.addTransform('shape', [sides ?? 3, radius ?? 0.3, smoothing ?? 0.01]);
	}

	public solid(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this {
		return this.addTransform('solid', [r ?? 0.0, g ?? 0.0, b ?? 0.0, a ?? 1.0]);
	}

	public src(_layer?: unknown): this {
		return this.addTransform('src', []);
	}

	// ============================================================
	// COORDINATE TRANSFORMS
	// ============================================================

	public rotate(angle?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addTransform('rotate', [angle ?? 10.0, speed ?? 0.0]);
	}

	public scale(amount?: SynthParameterValue, xMult?: SynthParameterValue, yMult?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue): this {
		return this.addTransform('scale', [amount ?? 1.5, xMult ?? 1.0, yMult ?? 1.0, offsetX ?? 0.5, offsetY ?? 0.5]);
	}

	public scroll(scrollX?: SynthParameterValue, scrollY?: SynthParameterValue, speedX?: SynthParameterValue, speedY?: SynthParameterValue): this {
		return this.addTransform('scroll', [scrollX ?? 0.5, scrollY ?? 0.5, speedX ?? 0.0, speedY ?? 0.0]);
	}

	public scrollX(scrollX?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addTransform('scrollX', [scrollX ?? 0.5, speed ?? 0.0]);
	}

	public scrollY(scrollY?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addTransform('scrollY', [scrollY ?? 0.5, speed ?? 0.0]);
	}

	public pixelate(pixelX?: SynthParameterValue, pixelY?: SynthParameterValue): this {
		return this.addTransform('pixelate', [pixelX ?? 20.0, pixelY ?? 20.0]);
	}

	public repeat(repeatX?: SynthParameterValue, repeatY?: SynthParameterValue, offsetX?: SynthParameterValue, offsetY?: SynthParameterValue): this {
		return this.addTransform('repeat', [repeatX ?? 3.0, repeatY ?? 3.0, offsetX ?? 0.0, offsetY ?? 0.0]);
	}

	public repeatX(reps?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('repeatX', [reps ?? 3.0, offset ?? 0.0]);
	}

	public repeatY(reps?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('repeatY', [reps ?? 3.0, offset ?? 0.0]);
	}

	public kaleid(nSides?: SynthParameterValue): this {
		return this.addTransform('kaleid', [nSides ?? 4.0]);
	}

	// ============================================================
	// COLOR TRANSFORMS
	// ============================================================

	public brightness(amount?: SynthParameterValue): this {
		return this.addTransform('brightness', [amount ?? 0.4]);
	}

	public contrast(amount?: SynthParameterValue): this {
		return this.addTransform('contrast', [amount ?? 1.6]);
	}

	public invert(amount?: SynthParameterValue): this {
		return this.addTransform('invert', [amount ?? 1.0]);
	}

	public saturate(amount?: SynthParameterValue): this {
		return this.addTransform('saturate', [amount ?? 2.0]);
	}

	public hue(hue?: SynthParameterValue): this {
		return this.addTransform('hue', [hue ?? 0.4]);
	}

	public colorama(amount?: SynthParameterValue): this {
		return this.addTransform('colorama', [amount ?? 0.005]);
	}

	public posterize(bins?: SynthParameterValue, gamma?: SynthParameterValue): this {
		return this.addTransform('posterize', [bins ?? 3.0, gamma ?? 0.6]);
	}

	public luma(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this {
		return this.addTransform('luma', [threshold ?? 0.5, tolerance ?? 0.1]);
	}

	public thresh(threshold?: SynthParameterValue, tolerance?: SynthParameterValue): this {
		return this.addTransform('thresh', [threshold ?? 0.5, tolerance ?? 0.04]);
	}

	public color(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this {
		return this.addTransform('color', [r ?? 1.0, g ?? 1.0, b ?? 1.0, a ?? 1.0]);
	}

	public r(scale?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('r', [scale ?? 1.0, offset ?? 0.0]);
	}

	public g(scale?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('g', [scale ?? 1.0, offset ?? 0.0]);
	}

	public b(scale?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addTransform('b', [scale ?? 1.0, offset ?? 0.0]);
	}

	public shift(r?: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this {
		return this.addTransform('shift', [r ?? 0.5, g ?? 0.0, b ?? 0.0, a ?? 0.0]);
	}

	public gamma(amount?: SynthParameterValue): this {
		return this.addTransform('gamma', [amount ?? 1.0]);
	}

	public levels(inMin?: SynthParameterValue, inMax?: SynthParameterValue, outMin?: SynthParameterValue, outMax?: SynthParameterValue, gamma?: SynthParameterValue): this {
		return this.addTransform('levels', [inMin ?? 0.0, inMax ?? 1.0, outMin ?? 0.0, outMax ?? 1.0, gamma ?? 1.0]);
	}

	public clamp(min?: SynthParameterValue, max?: SynthParameterValue): this {
		return this.addTransform('clamp', [min ?? 0.0, max ?? 1.0]);
	}

	// ============================================================
	// COMBINE OPERATIONS
	// ============================================================

	public add(source: SynthSource, amount?: SynthParameterValue): this {
		return this.addCombineTransform('add', source, [amount ?? 0.5]);
	}

	public sub(source: SynthSource, amount?: SynthParameterValue): this {
		return this.addCombineTransform('sub', source, [amount ?? 0.5]);
	}

	public mult(source: SynthSource, amount?: SynthParameterValue): this {
		return this.addCombineTransform('mult', source, [amount ?? 0.5]);
	}

	public blend(source: SynthSource, amount?: SynthParameterValue): this {
		return this.addCombineTransform('blend', source, [amount ?? 0.5]);
	}

	public diff(source: SynthSource): this {
		return this.addCombineTransform('diff', source, []);
	}

	public layer(source: SynthSource): this {
		return this.addCombineTransform('layer', source, []);
	}

	public mask(source: SynthSource): this {
		return this.addCombineTransform('mask', source, []);
	}

	// ============================================================
	// MODULATION (combineCoord)
	// ============================================================

	public modulate(source: SynthSource, amount?: SynthParameterValue): this {
		return this.addCombineTransform('modulate', source, [amount ?? 0.1]);
	}

	public modulateScale(source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addCombineTransform('modulateScale', source, [multiple ?? 1.0, offset ?? 1.0]);
	}

	public modulateRotate(source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addCombineTransform('modulateRotate', source, [multiple ?? 1.0, offset ?? 0.0]);
	}

	public modulatePixelate(source: SynthSource, multiple?: SynthParameterValue, offset?: SynthParameterValue): this {
		return this.addCombineTransform('modulatePixelate', source, [multiple ?? 10.0, offset ?? 3.0]);
	}

	public modulateKaleid(source: SynthSource, nSides?: SynthParameterValue): this {
		return this.addCombineTransform('modulateKaleid', source, [nSides ?? 4.0]);
	}

	public modulateScrollX(source: SynthSource, scrollX?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addCombineTransform('modulateScrollX', source, [scrollX ?? 0.5, speed ?? 0.0]);
	}

	public modulateScrollY(source: SynthSource, scrollY?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addCombineTransform('modulateScrollY', source, [scrollY ?? 0.5, speed ?? 0.0]);
	}

	// ============================================================
	// CHARACTER MODIFIERS
	// ============================================================

	public charFlipX(toggle?: SynthParameterValue): this {
		return this.addTransform('charFlipX', [toggle ?? 1.0]);
	}

	public charFlipY(toggle?: SynthParameterValue): this {
		return this.addTransform('charFlipY', [toggle ?? 1.0]);
	}

	public charInvert(toggle?: SynthParameterValue): this {
		return this.addTransform('charInvert', [toggle ?? 1.0]);
	}

	public charRotate(angle?: SynthParameterValue, speed?: SynthParameterValue): this {
		return this.addTransform('charRotate', [angle ?? 0.0, speed ?? 0.0]);
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
	 * Get the character source if defined (from char() function).
	 * @ignore
	 */
	public get charSource(): SynthSource | undefined {
		return this._charSource;
	}

	/**
	 * Get the character count if defined (from char() function).
	 * @ignore
	 */
	public get charCount(): number | undefined {
		return this._charCount;
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
}
