/**
 * createDefaultRuntime - Constructs the package's default SynthRuntime.
 *
 * Installs all built-in transforms through the same runtime implementation
 * that custom extensions use, and makes the runtime the module-level active
 * runtime so static built-in exports and chain methods resolve it.
 */

import { SynthSource } from '../core/SynthSource';
import { ALL_TRANSFORMS } from '../transforms/categories';
import { SynthRuntime, makeActiveRuntime } from './SynthRuntime';

let cached: SynthRuntime | null = null;

/**
 * Create (or return the already-created) default runtime.
 * Idempotent so repeated imports during hot reload do not stack bindings.
 */
export function createDefaultRuntime(): SynthRuntime {
	if (cached) return cached;

	const runtime = new SynthRuntime({
		prototype: SynthSource.prototype,
		createSource: () => new SynthSource(),
	});

	makeActiveRuntime(runtime);

	// Install built-ins through the same path custom extensions use.
	runtime.install(ALL_TRANSFORMS, {
		builtIn: true,
		conflict: 'replace',
		exposeGlobal: false,
	});

	cached = runtime;
	return runtime;
}
