/**
 * Shared runtime types for the extensibility layer.
 */

import type { SynthSource } from '../core/SynthSource';

/**
 * A standalone function that starts a source chain.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/type-aliases/SourceFunction | SourceFunction API reference}
 */
export type SourceFunction = (...args: unknown[]) => SynthSource;

/**
 * Options controlling a single or batch registration.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionOptions | ExtensionOptions API reference}
 */
export interface ExtensionOptions {
	/**
	 * Conflict policy when a public name is already registered.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionOptions#conflict | ExtensionOptions.conflict API reference}
	 */
	readonly conflict?: 'error' | 'replace';
	/**
	 * Whether a `src`-type definition is exposed as a browser global.
	 * `'auto'` exposes only when a browser global object exists.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionOptions#exposeglobal | ExtensionOptions.exposeGlobal API reference}
	 */
	readonly exposeGlobal?: boolean | 'auto';
}

/**
 * Handle returned by a successful registration.
 *
 * `dispose()` restores the previous binding (method, source function, and
 * global property) and is idempotent. Disposing an older shadowed handle does
 * not remove a newer registration.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionRegistration | ExtensionRegistration API reference}
 */
export interface ExtensionRegistration {
	/**
	 * Public names registered by this call.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionRegistration#names | ExtensionRegistration.names API reference}
	 */
	readonly names: readonly string[];
	/**
	 * Standalone source functions for `src`-type definitions.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionRegistration#sources | ExtensionRegistration.sources API reference}
	 */
	readonly sources: Readonly<Record<string, SourceFunction>>;
	/**
	 * Revert this registration, restoring any previous bindings.
	 *
	 * @example
	 * ```js
	 * const registration = setFunction(definition);
	 * registration.dispose();
	 * ```
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/ExtensionRegistration#dispose | ExtensionRegistration.dispose API reference}
	 */
	dispose(): void;
}
