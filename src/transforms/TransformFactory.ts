import type { TransformDefinition, TransformInput } from './TransformDefinition';
import { transformRegistry } from './TransformRegistry';
import type { SynthParameterValue } from '../core/types';
import type { SynthSource } from '../core/SynthSource';

/**
 * Interface for the SynthSource class that will have methods injected.
 * This is used to avoid circular dependencies.
 */
export interface SynthSourcePrototype {
	addTransform(name: string, userArgs: SynthParameterValue[]): unknown;
	addCombineTransform(name: string, source: unknown, userArgs: SynthParameterValue[]): unknown;
}

/**
 * Map of source-type transform names for generator function creation.
 */
const SOURCE_TYPE_TRANSFORMS = new Set(['src']);

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
	private _synthSourceClass: (new () => SynthSourcePrototype) | null = null;

	/**
	 * Set the SynthSource class to inject methods into.
	 * This must be called before injectMethods.
	 */
	public setSynthSourceClass(cls: new () => SynthSourcePrototype): void {
		this._synthSourceClass = cls;
	}

	/**
	 * Inject chainable methods into the SynthSource prototype.
	 * This dynamically adds all registered transforms as methods.
	 */
	public injectMethods(prototype: SynthSourcePrototype): void {
		const transforms = transformRegistry.getAll();

		for (const transform of transforms) {
			this._injectMethod(prototype, transform);
		}
	}

	/**
	 * Inject a single method for a transform.
	 */
	private _injectMethod(prototype: SynthSourcePrototype, transform: TransformDefinition): void {
		const { name, inputs, type } = transform;

		// Handle combine and combineCoord types specially (they take a source as first arg)
		if (type === 'combine' || type === 'combineCoord') {
			(prototype as unknown as Record<string, unknown>)[name] = function (
				this: SynthSourcePrototype,
				source: unknown,
				...args: SynthParameterValue[]
			) {
				return this.addCombineTransform(name, source, resolveArgs(inputs, args));
			};
		} else {
			// Standard transform - just takes parameter values
			(prototype as unknown as Record<string, unknown>)[name] = function (
				this: SynthSourcePrototype,
				...args: SynthParameterValue[]
			) {
				return this.addTransform(name, resolveArgs(inputs, args));
			};
		}
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
					return source.addTransform(
						name,
						resolveArgs(inputs, args)
					) as SynthSource;
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
	public addTransform(transform: TransformDefinition, prototype?: SynthSourcePrototype): void {
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
				return source.addTransform(
					name,
					resolveArgs(inputs, args)
				) as SynthSource;
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
