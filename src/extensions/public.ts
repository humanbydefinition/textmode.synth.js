/**
 * Public transform extension facade.
 *
 * {@link setFunction} is the single entry point for the extensibility API. It
 * registers transform and source definitions at runtime: pass one definition
 * or an array for an atomic batch install, and control replacement with the
 * `conflict` option.
 *
 * @module
 */

import type { TransformDefinition } from './types';
import type { ExtensionOptions, ExtensionRegistration } from '../runtime/types';
import { getRuntime } from '../runtime/runtimeAccessor';

/**
 * Register one or more transform definitions using Hydra's `setFunction()`
 * contract.
 *
 * Accepts a single definition or an array of definitions installed atomically
 * (the whole batch validates before any state changes). The default conflict
 * policy is `replace`, so a definition can redefine a built-in or an earlier
 * registration; pass `{ conflict: 'error' }` to reject name collisions instead.
 * Previously created chains keep their captured definition.
 *
 * A `src`-type definition becomes a standalone function returned in `sources`
 * and, in browser global mode, on `window`.
 *
 * @param definitions - A single definition or an array of definitions
 * @param options - Conflict policy and global exposure
 * @returns A registration handle whose `dispose()` restores the prior bindings
 *
 * @category Extensibility
 *
 * @example
 * {@includeCode ../../examples/CustomTransforms/setFunctionCoord/sketch.js}
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/functions/setFunction | setFunction API reference}
 */
export function setFunction(
	definitions: TransformDefinition | readonly TransformDefinition[],
	options?: ExtensionOptions
): ExtensionRegistration {
	return getRuntime().install(definitions, {
		conflict: options?.conflict ?? 'replace',
		...pickExposeGlobal(options),
	});
}

function pickExposeGlobal(options?: ExtensionOptions): { exposeGlobal?: boolean | 'auto' } {
	return options?.exposeGlobal !== undefined ? { exposeGlobal: options.exposeGlobal } : {};
}
