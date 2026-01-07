/**
 * Utilities module exports.
 *
 * This module provides utility classes and functions used throughout
 * the synth engine.
 *
 * @module
 */

// Array modulation utilities (Hydra-style)
export {
	EASING_FUNCTIONS,
	initArrayUtils,
	getArrayValue,
	isModulatedArray,
	type EasingFunction,
	type ModulatedArray,
} from './ArrayUtils';

// Character resolution
export { CharacterResolver } from './CharacterResolver';

// External layer reference collection
export { collectExternalLayerRefs } from './collectExternalLayerRefs';

// Safe dynamic parameter evaluation
export {
	safeEvaluateDynamic,
	createSafeUpdater,
	clearSafeEvalCache,
	setGlobalErrorCallback,
	getGlobalErrorCallback,
	type DynamicErrorCallback,
	type SafeEvalOptions,
} from './SafeEvaluator';


