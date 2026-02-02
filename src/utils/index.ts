/**
 * Utilities module exports.
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

// TextmodeSource reference collection
export { collectTextmodeSourceRefs } from './collectTextmodeSourceRefs';

// Dynamic parameter evaluation
export {
	setGlobalErrorCallback,
	getGlobalErrorCallback,
	type DynamicErrorCallback,
	type EvalOptions,
} from './SafeEvaluator';
