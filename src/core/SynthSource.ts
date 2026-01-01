import type {
	SynthParameterValue,
	CharacterMapping,
} from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import { ISynthSource } from './ISynthSource';

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

		return new SynthSource({
			chain: SynthChain.from(this._chain.transforms),
			charMapping: this._charMapping,
			colorSource: this._colorSource?.clone(),
			cellColorSource: this._cellColorSource?.clone(),
			charSource: this._charSource?.clone(),
			charCount: this._charCount,
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
}
