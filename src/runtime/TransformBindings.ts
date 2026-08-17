/**
 * TransformBindings - Binding coordinator for the default runtime.
 *
 * Unifies method injection, standalone source function generation, and global
 * exposure for registered transforms. Every install atomically updates the
 * chain method on the runtime prototype, the standalone source function, and
 * the optional global property. Disposal restores the previous state using
 * recorded property descriptors.
 */

import type { SynthParameterValue } from '../core/types';
import type { RegisteredTransform, NormalizedTransformInput } from '../transforms/TransformDefinition';
import { COMBINE_TYPES, TT_SRC } from '../core/constants';
import { SynthSource } from '../core/SynthSource';
import type { SynthRuntime } from './SynthRuntime';
import type { SourceFunction } from './types';
import { GlobalExposureAdapter } from './GlobalExposureAdapter';

/**
 * Options for installing a binding.
 */
export interface InstallBindingOptions {
	/** Whether a src-type definition should be exposed as a browser global. */
	readonly exposeGlobal: boolean;
}

interface BindingEntry {
	registered: RegisteredTransform;
	/** Descriptor present on the prototype before this install overwrote it. */
	priorDescriptor: PropertyDescriptor | 'absent';
	/** Source function owned by this registration (src types only). */
	sourceFunction?: SourceFunction;
	/** Whether this install exposed a global property. */
	globalExposed: boolean;
	disposed: boolean;
}

/**
 * Coordinates chain-method injection, standalone source functions, and global
 * exposure for a runtime. Binding state is stack-per-name so replacement and
 * disposal restore the previous descriptor.
 */
export class TransformBindings {
	private readonly _bindings = new Map<string, BindingEntry[]>();
	private readonly _global = new GlobalExposureAdapter();
	private readonly _createSource: () => SynthSource;

	/**
	 * Create the binding coordinator.
	 *
	 * @param prototype The prototype that receives chain methods.
	 * @param createSource Factory for new SynthSource instances.
	 */
	public constructor(prototype: object, createSource: () => SynthSource) {
		this._prototype = prototype;
		this._createSource = createSource;
	}

	private readonly _prototype: object;

	/**
	 * Install a registered transform, updating its chain method, source
	 * function, and optional global exposure together.
	 */
	public install(registered: RegisteredTransform, options: InstallBindingOptions): void {
		const stack = this._bindings.get(registered.name) ?? [];

		const entry: BindingEntry = {
			registered,
			priorDescriptor: readDescriptor(this._prototype, registered.name),
			sourceFunction: undefined,
			globalExposed: false,
			disposed: false,
		};

		const method = this._buildChainMethod(registered);
		Object.defineProperty(this._prototype, registered.name, {
			value: method,
			writable: true,
			configurable: true,
			enumerable: false,
		});

		if (registered.type === TT_SRC) {
			const sourceFunction = this._buildSourceFunction(registered);
			entry.sourceFunction = sourceFunction;
			if (options.exposeGlobal) {
				this._global.expose(registered.name, sourceFunction);
				entry.globalExposed = true;
			}
		}

		stack.push(entry);
		this._bindings.set(registered.name, stack);
	}

	/**
	 * Dispose a registration's bindings. Only the registration that owns the
	 * current top binding restores the prototype/global; shadowed disposals
	 * leave the newer binding intact. Idempotent.
	 */
	public dispose(registered: RegisteredTransform): boolean {
		const stack = this._bindings.get(registered.name);
		if (!stack) return false;

		const index = stack.findIndex((entry) => entry.registered.id === registered.id);
		if (index === -1 || stack[index].disposed) return false;

		const entry = stack[index];
		entry.disposed = true;
		stack.splice(index, 1);

		const wasTop = index === stack.length;
		if (wasTop) {
			if (entry.priorDescriptor === 'absent') {
				delete (this._prototype as Record<string, unknown>)[registered.name];
			} else {
				Object.defineProperty(this._prototype, registered.name, entry.priorDescriptor);
			}
			if (entry.globalExposed) {
				this._global.restore(registered.name);
			}
		}

		if (stack.length === 0) {
			this._bindings.delete(registered.name);
		}
		return true;
	}

	/**
	 * The current standalone source function for a name, if any.
	 */
	public sourceFunction(name: string): SourceFunction | undefined {
		const stack = this._bindings.get(name);
		return stack?.[stack.length - 1]?.sourceFunction;
	}

	private _buildChainMethod(registered: RegisteredTransform): (...args: unknown[]) => SynthSource {
		const { name, inputs, type } = registered;

		if (COMBINE_TYPES.has(type)) {
			return function (this: SynthSource, source: unknown, ...args: unknown[]): SynthSource {
				let actualSource = source;

				// Any SynthSource (including ones from other runtimes) stays a
				// source; primitives are wrapped in a same-runtime solid().
				if (!(source instanceof SynthSource)) {
					const wrapper = new (this.constructor as new (options?: { runtime?: SynthRuntime }) => SynthSource)(
						{
							runtime: this.runtime,
						}
					);
					const val = source as SynthParameterValue;
					const solidArgs = typeof val === 'number' ? [val, val, val, null] : [val, null, null, null];
					wrapper.addTransform('solid', solidArgs as SynthParameterValue[]);
					actualSource = wrapper;
				}

				return this.addCombineTransform(name, actualSource as SynthSource, resolveArgs(inputs, args));
			};
		}

		return function (this: SynthSource, ...args: unknown[]): SynthSource {
			args = expandColorArgs(name, args);
			return this.addTransform(name, resolveArgs(inputs, args));
		};
	}

	private _buildSourceFunction(registered: RegisteredTransform): SourceFunction {
		const { name, inputs } = registered;
		const createSource = this._createSource;
		return (...args: unknown[]): SynthSource => {
			const source = createSource();
			args = expandColorArgs(name, args);
			return source.addTransform(name, resolveArgs(inputs, args));
		};
	}
}

function readDescriptor(target: object, name: string): PropertyDescriptor | 'absent' {
	const descriptor = Object.getOwnPropertyDescriptor(target, name);
	return descriptor ?? 'absent';
}

/**
 * Resolve user arguments against the declared inputs, filling defaults.
 */
function resolveArgs(inputs: readonly NormalizedTransformInput[], args: readonly unknown[]): SynthParameterValue[] {
	return inputs.map((input, index) => (args[index] ?? input.default) as SynthParameterValue);
}

/**
 * Expand a single scalar argument for color-like transforms into RGB.
 */
function expandColorArgs(name: string, args: readonly unknown[]): unknown[] {
	if ((name === 'solid' || name === 'color') && args.length === 1 && typeof args[0] === 'number') {
		const val = args[0];
		return [val, val, val];
	}
	return [...args];
}
