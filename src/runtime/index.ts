/**
 * Runtime module exports.
 *
 * The runtime is an internal seam. Only the default runtime construction and
 * the shared extension types are reachable here; the catalog, bindings, and
 * validator remain private implementation details used by the runtime itself.
 *
 * @module
 */

export { SynthRuntime, makeActiveRuntime } from './SynthRuntime';
export { createDefaultRuntime } from './createDefaultRuntime';
export { getRuntime, hasRuntime, setRuntime } from './runtimeAccessor';
export type {
	ExtensionOptions,
	ExtensionRegistration,
	SourceFunction,
	SynthInspection,
	TransformInspection,
	UniformInspection,
	SamplerInspection,
} from './types';
