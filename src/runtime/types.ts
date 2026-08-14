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

/**
 * A single inspected transform in a compiled chain.
 */
export interface TransformInspection {
	/** Public name used by the JavaScript API. */
	readonly publicName: string;
	/** Generated GLSL function name. */
	readonly generatedName: string;
	/** Registration revision captured by the chain. */
	readonly revision: number;
	/** Transform type. */
	readonly type: string;
}

/**
 * A single inspected uniform.
 */
export interface UniformInspection {
	readonly name: string;
	readonly type: string;
	readonly isDynamic: boolean;
}

/**
 * A single inspected sampler binding.
 */
export interface SamplerInspection {
	readonly uniformName: string;
	readonly kind: 'layer' | 'textmodeSource' | 'feedback';
	readonly layerId?: string;
	readonly sourceId?: string;
}

/**
 * Structured inspection of a compiled synth source.
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection | SynthInspection API reference}
 */
export interface SynthInspection {
	/**
	 * Complete fragment shader source.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection#fragmentsource | SynthInspection.fragmentSource API reference}
	 */
	readonly fragmentSource: string;
	/**
	 * Transforms in call order, with their captured revisions.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection#transforms | SynthInspection.transforms API reference}
	 */
	readonly transforms: readonly TransformInspection[];
	/**
	 * Uniforms declared by the compiled shader.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection#uniforms | SynthInspection.uniforms API reference}
	 */
	readonly uniforms: readonly UniformInspection[];
	/**
	 * Sampler bindings (feedback, external layers, media sources).
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection#samplers | SynthInspection.samplers API reference}
	 */
	readonly samplers: readonly SamplerInspection[];
	/**
	 * Feedback channels sampled by the chain.
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/SynthInspection#feedbackchannels | SynthInspection.feedbackChannels API reference}
	 */
	readonly feedbackChannels: readonly ('charColor' | 'char' | 'cellColor')[];
}
