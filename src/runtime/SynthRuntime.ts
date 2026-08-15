/**
 * SynthRuntime - The single deep module behind synth extensibility.
 *
 * Its small public interface installs, inspects, and removes extensions; its
 * implementation owns definition validation, transform registration, source
 * function creation, chain-method binding, global exposure, and compilation.
 *
 * The default runtime is the module-level active runtime that static built-in
 * exports and `SynthSource` chain methods use.
 */

import type { SynthSource } from '../core/SynthSource';
import type { TransformDefinition, RegisteredTransform } from '../transforms/TransformDefinition';
import { TT_SRC } from '../core/constants';
import { compileSynthSource } from '../compiler/SynthCompiler';
import type { CompiledSynthShader } from '../compiler/types';
import { TransformCatalog } from './TransformCatalog';
import { TransformBindings, type SourceFunction } from './TransformBindings';
import { normalizeDefinition } from './TransformValidator';
import type { ExtensionOptions, ExtensionRegistration } from './types';
import { setRuntime } from './runtimeAccessor';

export interface SynthRuntimeOptions {
	/** Human-readable identity used in cross-runtime diagnostics. */
	readonly name?: string;
	/** Prototype that receives chain methods (default runtime: SynthSource.prototype). */
	readonly prototype: object;
	/** Factory for new SynthSource instances owned by this runtime. */
	readonly createSource: () => SynthSource;
}

export interface InstallOptions extends ExtensionOptions {
	/** Mark definitions as built-in (used during default runtime construction). */
	readonly builtIn?: boolean;
}

function resolveExposeGlobal(exposeGlobal: boolean | 'auto' | undefined): boolean {
	if (exposeGlobal === true) return true;
	if (exposeGlobal === false) return false;
	return typeof window !== 'undefined';
}

export class SynthRuntime {
	/** The runtime-owned transform catalog (internal seam). */
	public readonly catalog: TransformCatalog;

	/** Human-readable identity for cross-runtime diagnostics. */
	public readonly name: string;

	private readonly _bindings: TransformBindings;
	private readonly _createSource: () => SynthSource;

	public constructor(options: SynthRuntimeOptions) {
		this.catalog = new TransformCatalog();
		this.name = options.name ?? 'default';
		this._createSource = options.createSource;
		this._bindings = new TransformBindings(options.prototype, options.createSource);
	}

	/**
	 * Atomically install one or more transform definitions.
	 *
	 * Validation and conflict resolution run for the whole batch before any
	 * state is mutated. On success a handle is returned whose `dispose()`
	 * restores the previous bindings. The default conflict policy is `error`;
	 * pass `conflict: 'replace'` to allow redefinition (used by `setFunction`).
	 */
	public install(
		definitions: TransformDefinition | readonly TransformDefinition[],
		options?: InstallOptions
	): ExtensionRegistration {
		const list = Array.isArray(definitions) ? definitions : [definitions];
		const conflict = options?.conflict ?? 'error';
		const exposeGlobal = resolveExposeGlobal(options?.exposeGlobal);
		const builtIn = options?.builtIn ?? false;

		if (list.length === 0) {
			throw new Error('[textmode.synth.js] install() requires at least one transform definition.');
		}

		// 1. Validate and normalize the entire batch before mutating anything.
		const normalized = list.map((definition) => normalizeDefinition(definition));

		// 2. Resolve conflicts for the entire batch, including intra-batch dupes.
		const seen = new Set<string>();
		for (const definition of normalized) {
			const registered = this.catalog.current(definition.name);
			if (registered && !registered.builtIn && conflict === 'error') {
				throw new Error(
					`[textmode.synth.js] Cannot install transform "${definition.name}": a transform with that name is already registered. ` +
						'Pass { conflict: "replace" } to replace it, or dispose the existing registration first.'
				);
			}
			if (registered?.builtIn && conflict === 'error') {
				throw new Error(
					`[textmode.synth.js] Cannot install transform "${definition.name}": that name is a built-in transform. ` +
						'Use setFunction() (which allows replacement) or choose a different name.'
				);
			}
			if (seen.has(definition.name)) {
				throw new Error(
					`[textmode.synth.js] Batch install defines "${definition.name}" more than once. Each name must be unique within a batch.`
				);
			}
			seen.add(definition.name);
		}

		// 3. Register in the catalog (transactional).
		const registered: RegisteredTransform[] = [];
		try {
			for (const definition of normalized) {
				registered.push(this.catalog.install(definition, builtIn));
			}
		} catch (error) {
			for (const entry of registered) {
				this.catalog.dispose(entry);
			}
			throw error;
		}

		// 4. Bind methods, source functions, and globals (transactional).
		try {
			for (const entry of registered) {
				this._bindings.install(entry, { exposeGlobal });
			}
		} catch (error) {
			for (const entry of registered) {
				this._bindings.dispose(entry);
				this.catalog.dispose(entry);
			}
			throw error;
		}

		// 5. Build the registration handle.
		const sources: Record<string, SourceFunction> = {};
		for (const entry of registered) {
			if (entry.type === TT_SRC) {
				const sourceFunction = this._bindings.sourceFunction(entry.name);
				if (sourceFunction) {
					sources[entry.name] = sourceFunction;
				}
			}
		}

		let disposed = false;
		return Object.freeze({
			names: Object.freeze(registered.map((entry) => entry.name)),
			sources: Object.freeze(sources),
			dispose: () => {
				if (disposed) return;
				disposed = true;
				for (const entry of registered) {
					this._bindings.dispose(entry);
					this.catalog.dispose(entry);
				}
			},
		});
	}

	/**
	 * The current standalone source function for a `src`-type definition.
	 */
	public source(name: string): SourceFunction | undefined {
		return this._bindings.sourceFunction(name);
	}

	/**
	 * Look up the current registered transform for a public name.
	 */
	public lookup(name: string): RegisteredTransform | undefined {
		return this.catalog.current(name);
	}

	/**
	 * Create a new empty SynthSource owned by this runtime.
	 */
	public createSource(): SynthSource {
		return this._createSource();
	}

	/**
	 * Compile a SynthSource into a shader.
	 */
	public compile(source: SynthSource): CompiledSynthShader {
		return compileSynthSource(source);
	}
}

/** Make a runtime the active module-level runtime. */
export function makeActiveRuntime(runtime: SynthRuntime): void {
	setRuntime(runtime);
}
