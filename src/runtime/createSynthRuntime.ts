/**
 * createSynthRuntime - Construct an isolated SynthRuntime.
 *
 * An isolated runtime owns its catalog, a runtime-specific `SynthSource`
 * subclass, source functions, and compiler. It never mutates the default
 * runtime or the browser global object unless `exposeGlobal` is explicitly
 * enabled. Multiple runtimes can coexist and even define the same public
 * function name differently without sharing methods, functions, globals, or
 * catalog state.
 */

import { SynthSource, type SynthSourceCreateOptions } from '../core/SynthSource';
import { ALL_TRANSFORMS } from '../transforms/categories';
import type { TransformDefinition } from '../transforms/TransformDefinition';
import type { CompiledSynthShader } from '../compiler/types';
import { SynthRuntime } from './SynthRuntime';
import type { ExtensionOptions, ExtensionRegistration, SourceFunction, SynthInspection } from './types';

/**
 * Options for constructing an isolated runtime.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/CreateSynthRuntimeOptions | CreateSynthRuntimeOptions API reference}
 */
export interface CreateSynthRuntimeOptions {
	/**
	 * Human-readable runtime name used in cross-runtime diagnostics.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/CreateSynthRuntimeOptions#name | CreateSynthRuntimeOptions.name API reference}
	 */
	readonly name?: string;
	/**
	 * Additional transforms installed into the isolated runtime.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/CreateSynthRuntimeOptions#transforms | CreateSynthRuntimeOptions.transforms API reference}
	 */
	readonly transforms?: TransformDefinition | readonly TransformDefinition[];
	/**
	 * Whether `src`-type definitions are exposed as browser globals.
	 * Defaults to `false`; isolated runtimes avoid global pollution.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/CreateSynthRuntimeOptions#exposeglobal | CreateSynthRuntimeOptions.exposeGlobal API reference}
	 */
	readonly exposeGlobal?: boolean | 'auto';
}

/**
 * The public facade of an isolated runtime.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime | IsolatedSynthRuntime API reference}
 */
export interface IsolatedSynthRuntime {
	/**
	 * Runtime name for diagnostics.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#name | IsolatedSynthRuntime.name API reference}
	 */
	readonly name: string;
	/**
	 * Standalone source functions (built-ins plus registered `src` types).
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#sources | IsolatedSynthRuntime.sources API reference}
	 */
	readonly sources: Readonly<Record<string, SourceFunction>>;
	/**
	 * The current standalone source function for a name, if any.
	 *
	 * @example
	 * ```js
	 * const synth = createSynthRuntime();
	 * synth.source('osc');
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#source | IsolatedSynthRuntime.source API reference}
	 */
	source(name: string): SourceFunction | undefined;
	/**
	 * Compile a chain owned by this runtime into a shader.
	 *
	 * @example
	 * ```js
	 * const compiled = synth.compile(synth.sources.osc());
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#compile | IsolatedSynthRuntime.compile API reference}
	 */
	compile(source: SynthSource): CompiledSynthShader;
	/**
	 * Structurally inspect a chain owned by this runtime.
	 *
	 * @example
	 * ```js
	 * const inspection = synth.inspect(synth.sources.osc());
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#inspect | IsolatedSynthRuntime.inspect API reference}
	 */
	inspect(source: SynthSource): SynthInspection;
	/**
	 * Create a new empty chain owned by this runtime.
	 *
	 * @example
	 * ```js
	 * const source = synth.createSource().osc();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#createsource | IsolatedSynthRuntime.createSource API reference}
	 */
	createSource(): SynthSource;
	/**
	 * Register additional transforms into this runtime.
	 *
	 * @example
	 * ```js
	 * const registration = synth.install(myColorTransform);
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/IsolatedSynthRuntime#install | IsolatedSynthRuntime.install API reference}
	 */
	install(
		definitions: TransformDefinition | readonly TransformDefinition[],
		options?: ExtensionOptions
	): ExtensionRegistration;
}

let isolatedCounter = 0;

/**
 * Create an isolated synth runtime.
 *
 * @example
 * ```js
 * const synth = createSynthRuntime({
 *   transforms: [mySource, myColor],
 *   exposeGlobal: false,
 * });
 *
 * const { osc, mySource } = synth.sources;
 * t.synth(mySource().diff(osc()));
 * ```
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/createSynthRuntime | createSynthRuntime API reference}
 */
export function createSynthRuntime(options: CreateSynthRuntimeOptions = {}): IsolatedSynthRuntime {
	const sourceClass = class RuntimeSynthSource extends SynthSource {};

	const runtime: SynthRuntime = new SynthRuntime({
		name: options.name ?? `isolated-${++isolatedCounter}`,
		prototype: sourceClass.prototype,
		createSource: () => new sourceClass({ runtime } as SynthSourceCreateOptions),
	});

	// Install built-ins through the same runtime implementation.
	runtime.install(ALL_TRANSFORMS, { builtIn: true, conflict: 'replace', exposeGlobal: false });

	if (options.transforms) {
		runtime.install(options.transforms, {
			conflict: 'replace',
			exposeGlobal: options.exposeGlobal ?? false,
		});
	}

	const sources: Record<string, SourceFunction> = {};
	for (const entry of runtime.catalog.sourceTransforms()) {
		const sourceFunction = runtime.source(entry.name);
		if (sourceFunction) {
			sources[entry.name] = sourceFunction;
		}
	}

	return {
		name: runtime.name,
		sources: Object.freeze(sources),
		source: (name) => runtime.source(name),
		compile: (source) => runtime.compile(source),
		inspect: (source) => runtime.inspect(source),
		createSource: () => runtime.createSource(),
		install: (definitions, installOptions) =>
			runtime.install(definitions, {
				conflict: installOptions?.conflict ?? 'error',
				exposeGlobal: installOptions?.exposeGlobal ?? false,
			}),
	};
}
