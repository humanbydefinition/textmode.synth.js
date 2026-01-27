import type { SynthParameterValue, CharacterMapping, ExternalLayerReference } from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import type { ISynthSource } from './ISynthSource';

// Declaration merging: TypeScript knows SynthSource has all ISynthSource methods
// The actual method implementations are injected at runtime by TransformFactory
export interface SynthSource extends ISynthSource {}

/**
 * Options for creating a new SynthSource.
 */
export interface SynthSourceCreateOptions {
	chain?: SynthChain;
	charMapping?: CharacterMapping;
	colorSource?: SynthSource;
	cellColorSource?: SynthSource;
	charSource?: SynthSource;
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
	private _colorSource?: SynthSource;

	/** Reference to the cell color source chain (if any) */
	private _cellColorSource?: SynthSource;

	/** Reference to the character source chain (if any) - used by char() function */
	private _charSource?: SynthSource;

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
		this._nestedSources = options?.nestedSources ?? new Map();
		this._externalLayerRefs = options?.externalLayerRefs ?? new Map();
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
	public addCombineTransform(
		name: string,
		source: SynthSource,
		userArgs: SynthParameterValue[]
	): this {
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

	public charMap(chars: string): this {
		const charArray = Array.from(chars);
		const indices: number[] = [];

		for (const char of charArray) {
			indices.push(char.codePointAt(0) ?? 32);
		}

		this._charMapping = { chars, indices };

		return this;
	}

	private _ensureSource(
		rOrSource: SynthParameterValue | ISynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): SynthSource {
		if (rOrSource instanceof SynthSource) {
			return rOrSource;
		}

		const source = new SynthSource();
		let args: (SynthParameterValue | null)[];

		// Handle scalar expansion: if only r is provided and it's a number,
		// replicate it to g and b to create a grayscale color.
		if (
			typeof rOrSource === 'number' &&
			g === undefined &&
			b === undefined &&
			a === undefined
		) {
			args = [rOrSource, rOrSource, rOrSource, 1.0];
		} else {
			// Map undefined to null to satisfy SynthParameterValue type
			// We cast rOrSource to SynthParameterValue because if it were an ISynthSource
			// but not a SynthSource instance (checked above), it wouldn't be valid for solid() anyway.
			args = [rOrSource as SynthParameterValue, g, b, a].map((v) =>
				v === undefined ? null : v
			);
		}

		source.addTransform('solid', args as SynthParameterValue[]);
		return source;
	}

	public charColor(
		rOrSource: SynthParameterValue | ISynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		this._colorSource = this._ensureSource(rOrSource, g, b, a);
		return this;
	}

	public char(source: SynthSource): this {
		this._charSource = source;
		return this;
	}

	public cellColor(
		rOrSource: SynthParameterValue | ISynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		this._cellColorSource = this._ensureSource(rOrSource, g, b, a);
		return this;
	}

	public paint(
		rOrSource: SynthParameterValue | ISynthSource,
		g?: SynthParameterValue,
		b?: SynthParameterValue,
		a?: SynthParameterValue
	): this {
		const source = this._ensureSource(rOrSource, g, b, a);
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
			nestedSources: clonedNestedSources,
			externalLayerRefs: clonedExternalLayerRefs,
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
