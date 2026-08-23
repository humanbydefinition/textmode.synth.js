import type {
	SynthParameterValue,
	CharacterMapping,
	ExternalLayerReference,
	TextmodeSourceReference,
	UpdatableTextmodeSource,
} from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import { getRuntime } from '../runtime/runtimeAccessor';
import type { SynthRuntime } from '../runtime/SynthRuntime';
import type { RegisteredTransform } from '../transforms/TransformDefinition';
import { generateSourceId, isTextmodeSourceLike } from '../utils/TextmodeSourceGuard';

/**
 * Options for creating a new SynthSource.
 */
export interface SynthSourceCreateOptions {
	/** Runtime this source belongs to (defaults to the active runtime). */
	runtime?: SynthRuntime;
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
 * @category Synthesis Chains
 *
 * @categoryDescription Sources & Sampling
 * Methods that begin a chain from procedural patterns, feedback, or a sampled source.
 *
 * @categoryDescription Coordinate transforms
 * Methods that reshape the sampling coordinates before a source is evaluated.
 *
 * @categoryDescription Color transforms
 * Methods that adjust, extract, or remap the colors produced by a source.
 *
 * @categoryDescription Combining sources
 * Methods that blend, mask, or layer one synth source with another.
 *
 * @categoryDescription Coordinate modulation
 * Methods that use one source to distort another source's coordinates.
 *
 * @categoryDescription Output Channels
 * Methods that choose characters and route values to character and cell colors.
 *
 * @categoryDescription Chain utilities
 * Methods for reusing or copying an existing synthesis chain.
 *
 * @categoryDescription Determinism
 * Methods that make noise-based source chains reproducible.
 *
 * @showCategories
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
 * t.synth(synth);
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource | SynthSource API reference}
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

	/** Runtime identity for isolated runtimes; undefined means the active runtime. */
	private readonly _runtime?: SynthRuntime;

	/**
	 * Create a new SynthSource.
	 *
	 * @param options Optional initialization options
	 * @ignore
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
		this._runtime = options?.runtime;
	}

	/**
	 * The runtime this source resolves transforms through.
	 * Sources created by an isolated runtime keep that identity; sources from
	 * the default runtime resolve the module-level active runtime.
	 *
	 * @ignore
	 */
	public get runtime(): SynthRuntime {
		return this._runtime ?? getRuntime();
	}

	/**
	 * Add a transform to the chain.
	 * This method is called by dynamically injected transform methods.
	 *
	 * The current runtime registration is captured as an immutable snapshot so
	 * redefinition affects future chains, never this one.
	 *
	 * @ignore
	 */
	public addTransform(name: string, userArgs: SynthParameterValue[]): this {
		const transform = this._resolveTransform(name);
		const index = this._chain.length;
		this._attachSamplerRefs(index, transform, userArgs);
		this._attachNestedSources(index, transform, userArgs);
		const record: TransformRecord = { name, userArgs, transform };

		// Use the chain's internal mutation method for the fluent API
		this._chain.push(record);

		return this;
	}

	/**
	 * Add a combine transform that references another source.
	 *
	 * @ignore
	 */
	public addCombineTransform(name: string, source: SynthSource, userArgs: SynthParameterValue[]): this {
		this._assertSameRuntime(source);
		const transform = this._resolveTransform(name);
		const index = this._chain.length;
		this._attachSamplerRefs(index, transform, userArgs);
		this._nestedSources.set(index, source);
		const record: TransformRecord = { name, userArgs, transform };
		this._chain.push(record);
		return this;
	}

	/**
	 * Add an external layer reference at the current transform index.
	 * Used by src(layer) to track cross-layer sampling.
	 *
	 * @ignore
	 */
	public addExternalLayerRef(ref: ExternalLayerReference): this {
		const transform = this._resolveTransform('src');
		const index = this._chain.length;
		this._externalLayerRefs.set(index, ref);
		const record: TransformRecord = { name: 'src', userArgs: [], transform };
		this._chain.push(record);
		return this;
	}

	/**
	 * Add a TextmodeSource reference at the current transform index.
	 * Used by src(textmodeSource) to track image/video sampling.
	 *
	 * @ignore
	 */
	public addTextmodeSourceRef(ref: TextmodeSourceReference): this {
		const transform = this._resolveTransform('srcTexture');
		const index = this._chain.length;
		this._textmodeSourceRefs.set(index, ref);
		const record: TransformRecord = { name: 'srcTexture', userArgs: [], transform };
		this._chain.push(record);
		return this;
	}

	/**
	 * Apply a registered transform by name with explicit arguments.
	 *
	 * This is the typed escape hatch for dynamic extension code that does not
	 * want to augment the instance interface. It uses the same runtime lookup
	 * and chain-recording implementation as injected chain methods.
	 *
	 * @param name - Public transform name (must be registered)
	 * @param args - Arguments resolved against the declared inputs
	 * @returns The SynthSource for chaining
	 *
	 * @category Chain utilities
	 *
	 * @example
	 * ```js
	 * source.transform('duotone', [0.02, 0.04, 0.12], [1, 0.4, 0.1]);
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource#transform | SynthSource.transform API reference}
	 */
	public transform(name: string, ...args: SynthParameterValue[]): this {
		return this.addTransform(name, args);
	}

	/**
	 * Resolve the current runtime registration for a public name.
	 */
	private _resolveTransform(name: string): RegisteredTransform {
		const transform = this.runtime.lookup(name);
		if (!transform) {
			throw new Error(
				`[textmode.synth.js] Unknown transform "${name}" in runtime "${this.runtime.name}". ` +
					'Register it with setFunction() before use.'
			);
		}
		return transform;
	}

	/**
	 * Reject chains that combine sources from different runtimes with a
	 * diagnostic that names both runtimes.
	 */
	private _assertSameRuntime(other: SynthSource): void {
		if (other.runtime !== this.runtime) {
			throw new Error(
				`[textmode.synth.js] Cannot combine sources from different synth runtimes. ` +
					`This chain belongs to runtime "${this.runtime.name}" but the nested source belongs to ` +
					`runtime "${other.runtime.name}". Recreate the nested source from the same runtime, or register ` +
					`the transform in the target runtime.`
			);
		}
	}

	/**
	 * Attach a stable TextmodeSource reference for the first sampler2D input
	 * whose argument is a media source. The reference is created once at chain
	 * construction so recompiles reuse the same source id and uniform name.
	 *
	 * @ignore
	 */
	private _attachSamplerRefs(index: number, transform: RegisteredTransform, userArgs: SynthParameterValue[]): void {
		for (let j = 0; j < transform.inputs.length; j++) {
			const input = transform.inputs[j];
			if (input.type !== 'sampler2D') continue;
			const value = userArgs[j];
			if (value === null || value === undefined) continue;
			if (isTextmodeSourceLike(value) || typeof value === 'function') {
				this._textmodeSourceRefs.set(index, {
					sourceId: generateSourceId(),
					source: value as UpdatableTextmodeSource | (() => UpdatableTextmodeSource | undefined),
				});
			} else {
				throw new Error(
					`[textmode.synth.js] sampler2D input "${input.publicName}" requires a TextmodeSource (image/video), layer, or a lazy getter returning one.`
				);
			}
			// v1 supports one sampler input per transform; additional sampler
			// inputs in the same transform are rejected.
			break;
		}
	}

	/**
	 * Register a nested SynthSource passed to a compatible `vec4` input so it
	 * compiles recursively at the current coordinate/target. One nested source
	 * per transform index is supported.
	 *
	 * @ignore
	 */
	private _attachNestedSources(index: number, transform: RegisteredTransform, userArgs: SynthParameterValue[]): void {
		for (let j = 0; j < transform.inputs.length; j++) {
			const input = transform.inputs[j];
			if (input.type === 'vec4' && userArgs[j] instanceof SynthSource) {
				this._assertSameRuntime(userArgs[j] as SynthSource);
				this._nestedSources.set(index, userArgs[j] as SynthSource);
				break;
			}
		}
	}

	/**
	 * Map character indices to a specific character set.
	 * This is the primary textmode-native way to define which characters to use.
	 *
	 * @param chars A string of characters to map indices to
	 * @returns The SynthSource for chaining
	 *
	 * @category Output Channels
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/charMap/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/charMap | SynthSource.charMap API reference}
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
			this._assertSameRuntime(rOrSource);
			return rOrSource;
		}
		const source = new (this.constructor as new (options?: SynthSourceCreateOptions) => SynthSource)({
			runtime: this._runtime,
		});
		// If only a single number is provided, replicate it to RGB for grayscale consistency with default alpha 1.0
		const args =
			typeof rOrSource === 'number' && g === undefined && b === undefined && a === undefined
				? [rOrSource, rOrSource, rOrSource, 1]
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
	 * @category Output Channels
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/charColor/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/charColor | SynthSource.charColor API reference}
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
	 * {@includeCode ../../examples/SynthSource/charColor2/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/charColor | SynthSource.charColor API reference}
	 */
	charColor(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set the character foreground color using a grayscale value.
	 *
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/charColor3/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/charColor | SynthSource.charColor API reference}
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
	 * @category Output Channels
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/char/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/char | SynthSource.char API reference}
	 */
	public char(source: SynthSource): this {
		this._assertSameRuntime(source);
		this._charSource = source;
		return this;
	}

	/**
	 * Set the cell background colors using a color source chain.
	 *
	 * @param source A SynthSource producing color values, or RGBA values
	 * @returns The SynthSource for chaining
	 *
	 * @category Output Channels
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/cellColor/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/cellColor | SynthSource.cellColor API reference}
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
	 * {@includeCode ../../examples/SynthSource/cellColor2/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/cellColor | SynthSource.cellColor API reference}
	 */
	cellColor(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set the cell background color using a grayscale value.
	 *
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/cellColor3/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/cellColor | SynthSource.cellColor API reference}
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
	 * @category Output Channels
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/paint/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/paint | SynthSource.paint API reference}
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
	 * {@includeCode ../../examples/SynthSource/paint2/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/paint | SynthSource.paint API reference}
	 */
	paint(r: SynthParameterValue, g?: SynthParameterValue, b?: SynthParameterValue, a?: SynthParameterValue): this;
	/**
	 * Set both character foreground and cell background color using a grayscale value.
	 *
	 * @param gray - Grayscale value (0-1)
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/paint3/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/paint | SynthSource.paint API reference}
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
	 * @category Chain utilities
	 *
	 * @example
	 * {@includeCode ../../examples/SynthSource/clone/sketch.js}
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/classes/SynthSource/methods/clone | SynthSource.clone API reference}
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

		return new (this.constructor as new (options?: SynthSourceCreateOptions) => SynthSource)({
			runtime: this._runtime,
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
	 *
	 * @ignore
	 */
	public get transforms(): readonly TransformRecord[] {
		return this._chain.transforms;
	}

	/**
	 * Get the character mapping if defined.
	 *
	 * @ignore
	 */
	public get charMapping(): CharacterMapping | undefined {
		return this._charMapping;
	}

	/**
	 * Get the color source if defined.
	 *
	 * @ignore
	 */
	public get charColorSource(): SynthSource | undefined {
		return this._charColorSource;
	}

	/**
	 * Get the cell color source if defined.
	 *
	 * @ignore
	 */
	public get cellColorSource(): SynthSource | undefined {
		return this._cellColorSource;
	}

	/**
	 * Get the character source if defined (from char() function).
	 *
	 * @ignore
	 */
	public get charSource(): SynthSource | undefined {
		return this._charSource;
	}

	/**
	 * Get all nested sources for combine operations.
	 *
	 * @ignore
	 */
	public get nestedSources(): Map<number, SynthSource> {
		return this._nestedSources;
	}

	/**
	 * Get all external layer references for cross-layer sampling.
	 *
	 * @ignore
	 */
	public get externalLayerRefs(): Map<number, ExternalLayerReference> {
		return this._externalLayerRefs;
	}

	/**
	 * Get all TextmodeSource references for image/video sampling.
	 *
	 * @ignore
	 */
	public get textmodeSourceRefs(): Map<number, TextmodeSourceReference> {
		return this._textmodeSourceRefs;
	}
}
