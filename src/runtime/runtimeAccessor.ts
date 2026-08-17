/**
 * Runtime accessor indirection.
 *
 * Breaking the `SynthSource <-> default runtime` cycle: `SynthSource` reads the
 * active runtime through this module, while `createDefaultRuntime()` writes it.
 * The module-level binding is populated during bootstrap, before any source
 * chain method can be called.
 */

import type { SynthRuntime } from './SynthRuntime';

let activeRuntime: SynthRuntime | null = null;

export function setRuntime(runtime: SynthRuntime | null): void {
	activeRuntime = runtime;
}

export function getRuntime(): SynthRuntime {
	if (!activeRuntime) {
		throw new Error(
			'[textmode.synth.js] Synth runtime is not initialized. Import "textmode.synth.js" before creating chains.'
		);
	}
	return activeRuntime;
}
