/**
 * Public transform extension facade.
 *
 * - {@link setFunction} is the Hydra-compatible single-definition entry point.
 *   Its default conflict policy is `replace`, so it can redefine a built-in.
 * - {@link extendTransforms} is the package-oriented entry point for single or
 *   batch installs. Its default conflict policy is `error`.
 * - {@link defineSource} registers a procedural source and returns the
 *   standalone function with an attached `registration` handle.
 * - {@link inspectSynth} returns structured compiler data for debugging
 *   extensions without exposing compiler internals.
 *
 * All four share one underlying runtime operation; they are interface aliases,
 * not separate implementations.
 *
 * @module
 */

import type { TransformDefinition } from './types';
import type { ExtensionOptions, ExtensionRegistration, SourceFunction, SynthInspection } from '../runtime/types';
import type { SynthSource } from '../core/SynthSource';
import { getRuntime } from '../runtime/runtimeAccessor';
import { createSynthRuntime } from '../runtime/createSynthRuntime';

export { createSynthRuntime };
export type { CreateSynthRuntimeOptions, IsolatedSynthRuntime } from '../runtime/createSynthRuntime';

/**
 * Register a transform definition using Hydra's `setFunction()` contract.
 *
 * Replaces any existing registration with the same name (including built-ins)
 * for future chain calls; previously created chains keep their captured
 * revision. A `src`-type definition becomes a standalone function returned in
 * `sources` and, in browser global mode, on `window`.
 *
 * @param definition - The transform definition
 * @param options - Extension options (`exposeGlobal` only; conflict is always replace)
 * @returns A registration handle whose `dispose()` restores the prior binding
 *
 * @example
 * {@includeCode ../../examples/CustomTransforms/setFunctionCoord/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/setFunction | setFunction API reference}
 */
export function setFunction(
	definition: TransformDefinition,
	options?: Omit<ExtensionOptions, 'conflict'>
): ExtensionRegistration {
	return getRuntime().install(definition, {
		conflict: 'replace',
		...pickExposeGlobal(options),
	});
}

/**
 * Register one or more transform definitions atomically.
 *
 * The whole batch validates and resolves conflicts before any state is mutated.
 * Default conflict policy is `error`; pass `{ conflict: 'replace' }` to allow
 * redefinition.
 *
 * @param definitions - A single definition or an array of definitions
 * @param options - Conflict policy and global exposure
 * @returns A registration handle whose `dispose()` restores the prior bindings
 *
 * @example
 * {@includeCode ../../examples/CustomTransforms/extendTransforms/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/extendTransforms | extendTransforms API reference}
 */
export function extendTransforms(
	definitions: TransformDefinition | readonly TransformDefinition[],
	options?: ExtensionOptions
): ExtensionRegistration {
	return getRuntime().install(definitions, {
		conflict: options?.conflict ?? 'error',
		...pickExposeGlobal(options),
	});
}

/**
 * Register a procedural source and return its standalone chain-starter.
 *
 * The returned function is immediately usable as `mySource(...)`, appears as a
 * chain method `.mySource(...)`, and (in browser global mode) on `window`. Its
 * `registration` property exposes the {@link ExtensionRegistration} handle.
 *
 * @param definition - Source definition (the `type` is always `'src'`)
 * @param options - Global exposure options
 * @returns The standalone source function with an attached registration handle
 *
 * @example
 * {@includeCode ../../examples/CustomTransforms/defineSource/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/defineSource | defineSource API reference}
 */
export function defineSource(
	definition: Omit<TransformDefinition, 'type'>,
	options?: Omit<ExtensionOptions, 'conflict'>
): SourceFunction & { registration: ExtensionRegistration } {
	const registration = getRuntime().install(
		{ ...definition, type: 'src' },
		{
			conflict: 'replace',
			...pickExposeGlobal(options),
		}
	);

	const sourceFunction = registration.sources[definition.name];
	if (!sourceFunction) {
		registration.dispose();
		throw new Error(
			`[textmode.synth.js] defineSource() did not produce a source function for "${definition.name}".`
		);
	}

	return Object.assign(sourceFunction, { registration });
}

/**
 * Compile and inspect a synth source without logging.
 *
 * Returns the fragment shader, the captured transform revisions, uniforms, and
 * sampler bindings. Editors can render it, tests can assert it, and users can
 * copy the shader into WebGL tooling.
 *
 * @param source - The SynthSource chain to inspect
 * @returns Structured inspection data
 *
 * @example
 * ```js
 * const inspection = inspectSynth(osc(6).kaleid(4));
 * console.log(inspection.fragmentSource);
 * ```
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/inspectSynth | inspectSynth API reference}
 */
export function inspectSynth(source: SynthSource): SynthInspection {
	return getRuntime().inspect(source);
}

function pickExposeGlobal(options?: ExtensionOptions): { exposeGlobal?: boolean | 'auto' } {
	return options?.exposeGlobal !== undefined ? { exposeGlobal: options.exposeGlobal } : {};
}
