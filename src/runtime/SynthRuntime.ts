/**
 * SynthRuntime - The single deep module behind synth extensibility.
 *
 * Its small public interface installs, inspects, and removes extensions; its
 * implementation owns definition validation, transform registration, source
 * function creation, chain-method binding, global exposure, and compilation.
 *
 * The default runtime is the module-level active runtime that static built-in
 * exports and `SynthSource` chain methods use. A future isolated-runtime path
 * (`createSynthRuntime`) will construct additional instances with the same
 * interface without sharing catalog, bindings, or prototype state.
 */

import type { SynthSource } from '../core/SynthSource';
import type { TransformDefinition, RegisteredTransform } from '../transforms/TransformDefinition';
import { TT_SRC } from '../core/constants';
import { compileSynthSource } from '../compiler/SynthCompiler';
import type { CompiledSynthShader } from '../compiler/types';
import { CHANNEL_SUFFIXES, CHANNEL_SAMPLERS } from '../core/constants';
import type { TextureChannel } from '../core/types';
import { TransformCatalog } from './TransformCatalog';
import { TransformBindings, type SourceFunction } from './TransformBindings';
import { normalizeDefinition } from './TransformValidator';
import type {
	ExtensionOptions,
	ExtensionRegistration,
	SynthInspection,
	SamplerInspection,
	TransformInspection,
} from './types';
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

	/**
	 * Compile and structurally inspect a SynthSource without logging.
	 */
	public inspect(source: SynthSource): SynthInspection {
		const compiled = compileSynthSource(source);

		const transforms: TransformInspection[] = [];
		collectTransforms(source, transforms);

		const uniforms: SynthInspection['uniforms'] = Array.from(compiled.uniforms.values()).map((uniform) => ({
			name: uniform.name,
			type: uniform.type,
			isDynamic: uniform.isDynamic,
		}));

		const samplers: SamplerInspection[] = [];
		const feedbackChannels: TextureChannel[] = [];
		if (compiled.usesCharColorFeedback) feedbackChannels.push('charColor');
		if (compiled.usesCharFeedback) feedbackChannels.push('char');
		if (compiled.usesCellColorFeedback) feedbackChannels.push('cellColor');
		for (const channel of feedbackChannels) {
			samplers.push({ uniformName: CHANNEL_SAMPLERS[channel], kind: 'feedback' });
		}
		for (const [, info] of compiled.externalLayers) {
			for (const [channel, suffix] of Object.entries(CHANNEL_SUFFIXES) as Array<[TextureChannel, string]>) {
				if (info.usesChar && channel === 'char' && suffix) {
					samplers.push({
						uniformName: `${info.uniformPrefix}${suffix}`,
						kind: 'layer',
						layerId: info.layerId,
					});
				}
				if (info.usesCharColor && channel === 'charColor') {
					samplers.push({
						uniformName: `${info.uniformPrefix}${suffix}`,
						kind: 'layer',
						layerId: info.layerId,
					});
				}
				if (info.usesCellColor && channel === 'cellColor') {
					samplers.push({
						uniformName: `${info.uniformPrefix}${suffix}`,
						kind: 'layer',
						layerId: info.layerId,
					});
				}
			}
		}
		for (const [, info] of compiled.textmodeSources) {
			samplers.push({ uniformName: info.uniformName, kind: 'textmodeSource', sourceId: info.sourceId });
		}

		return {
			fragmentSource: compiled.fragmentSource,
			transforms,
			uniforms,
			samplers,
			feedbackChannels,
		};
	}
}

function collectTransforms(source: SynthSource, out: TransformInspection[]): void {
	for (const record of source.transforms) {
		const transform = record.transform;
		if (transform) {
			out.push({
				publicName: transform.name,
				generatedName: transform.glslName,
				revision: transform.revision,
				type: transform.type,
			});
		}
	}
	for (const nested of source.nestedSources.values()) {
		collectTransforms(nested, out);
	}
	if (source.charSource) collectTransforms(source.charSource, out);
	if (source.charColorSource) collectTransforms(source.charColorSource, out);
	if (source.cellColorSource) collectTransforms(source.cellColorSource, out);
}

/** Make a runtime the active module-level runtime. */
export function makeActiveRuntime(runtime: SynthRuntime): void {
	setRuntime(runtime);
}
