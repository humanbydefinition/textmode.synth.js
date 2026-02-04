import type { TransformDefinition, TransformInput } from './TransformDefinition';
import { transformRegistry } from './TransformRegistry';
import type { SynthParameterValue, SynthTransformType } from '../core/types';
import type { SynthSource } from '../core/SynthSource';
import { COMBINE_TYPES, TT_SRC } from '../core/transform-types';

/**
 * Map of source-type transform names for generator function creation.
 */
const SOURCE_TYPE_TRANSFORMS = new Set<SynthTransformType>([TT_SRC]);

/**
 * Generated standalone functions for source transforms.
 */
export interface GeneratedFunctions {
	[name: string]: (...args: SynthParameterValue[]) => SynthSource;
}

/**
 * Factory for generating dynamic transform methods.
 *
 * Handles the dynamic generation of chainable methods on
 * SynthSource based on registered transform definitions. It eliminates
 * the need to manually write boilerplate methods for each transform.
 */
class TransformFactory {
	private _generatedFunctions: GeneratedFunctions = {};
	private _synthSourceClass: (new () => SynthSource) | null = null;

	/**
	 * Set the SynthSource class to inject methods into.
	 * This must be called before injectMethods.
	 */
	public setSynthSourceClass(cls: new () => SynthSource): void {
		this._synthSourceClass = cls;
	}

	/**
	 * Inject chainable methods into the SynthSource prototype.
	 * This dynamically adds all registered transforms as methods.
	 */
	public injectMethods(prototype: SynthSource): void {
		const transforms = transformRegistry.getAll();

		for (const transform of transforms) {
			this._injectMethod(prototype, transform);
		}
	}

	/**
	 * Inject a single method for a transform.
	 */
	private _injectMethod(prototype: SynthSource, transform: TransformDefinition): void {
		const SynthSourceCtor = this._synthSourceClass;
		const { name, inputs, type } = transform;
		const proto = prototype as unknown as Record<string, unknown>;

		// Handle combine and combineCoord types specially (they take a source as first arg)
		if (COMBINE_TYPES.has(type)) {
			proto[name] = function (
				this: SynthSource,
				source: unknown,
				...args: SynthParameterValue[]
			) {
				let actualSource = source;

				// If source is a primitive (not a SynthSource), wrap it in a solid() source
				if (SynthSourceCtor && !(source instanceof SynthSourceCtor)) {
					const wrapper = new SynthSourceCtor();
					// solid() expects 4 arguments (r, g, b, a).
					// If source is a number, replicate it to RGB (grayscale/scalar).
					// Otherwise pass as first argument.
					const val = source as SynthParameterValue;
					const solidArgs =
						typeof val === 'number' ? [val, val, val, null] : [val, null, null, null];

					wrapper.addTransform('solid', solidArgs);
					actualSource = wrapper;
				}

				return this.addCombineTransform(
					name,
					actualSource as SynthSource,
					resolveArgs(inputs, args)
				);
			};
		} else {
			// Standard transform - just takes parameter values
			const factory = this;
			proto[name] = function (this: SynthSource, ...args: SynthParameterValue[]) {
				args = factory._expandColorArgs(name, args);
				return this.addTransform(name, resolveArgs(inputs, args));
			};
		}
	}

	/**
	 * Expands single scalar arguments for color transforms into RGB triplets.
	 * e.g., solid(0.5) -> solid(0.5, 0.5, 0.5)
	 */
	private _expandColorArgs(name: string, args: SynthParameterValue[]): SynthParameterValue[] {
		if (
			(name === 'solid' || name === 'color') &&
			args.length === 1 &&
			typeof args[0] === 'number'
		) {
			const val = args[0];
			// Use [val, val, val] and let defaults handle the rest (alpha)
			return [val, val, val];
		}
		return args;
	}

	/**
	 * Generate standalone functions for source-type transforms.
	 * These allow starting a chain without explicitly creating a SynthSource.
	 */
	public generateStandaloneFunctions(): GeneratedFunctions {
		if (!this._synthSourceClass) {
			throw new Error(
				'[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.'
			);
		}

		const functions: GeneratedFunctions = {};
		const transforms = transformRegistry.getAll();
		const SynthSourceCtor = this._synthSourceClass;

		for (const transform of transforms) {
			if (SOURCE_TYPE_TRANSFORMS.has(transform.type)) {
				const { name, inputs } = transform;

				functions[name] = (...args: SynthParameterValue[]) => {
					const source = new SynthSourceCtor();
					args = this._expandColorArgs(name, args);
					return source.addTransform(name, resolveArgs(inputs, args)) as SynthSource;
				};
			}
		}

		this._generatedFunctions = functions;
		return functions;
	}

	/**
	 * Get the generated standalone functions.
	 */
	public getGeneratedFunctions(): GeneratedFunctions {
		return this._generatedFunctions;
	}

	/**
	 * Add a new transform and inject its method.
	 * This can be used to add custom transforms at runtime.
	 */
	public addTransform(transform: TransformDefinition, prototype?: SynthSource): void {
		// Register in the registry
		transformRegistry.register(transform);

		// Inject method if prototype provided
		if (prototype) {
			this._injectMethod(prototype, transform);
		}

		// Generate standalone function if it's a source type
		if (SOURCE_TYPE_TRANSFORMS.has(transform.type) && this._synthSourceClass) {
			const SynthSourceCtor = this._synthSourceClass;
			const { name, inputs } = transform;

			this._generatedFunctions[name] = (...args: SynthParameterValue[]) => {
				const source = new SynthSourceCtor();
				args = this._expandColorArgs(name, args);
				return source.addTransform(name, resolveArgs(inputs, args)) as SynthSource;
			};
		}
	}
}

/**
 * Resolve arguments against transform input definitions.
 */
function resolveArgs(inputs: TransformInput[], args: SynthParameterValue[]): SynthParameterValue[] {
	return inputs.map((input, i) => args[i] ?? input.default);
}

/**
 * Singleton instance of the transform factory.
 */
export const transformFactory = new TransformFactory();
