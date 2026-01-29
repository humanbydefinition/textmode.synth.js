/**
 * Bootstrap module - Initializes the synth system on import.
 *
 * This module handles all side-effect initialization required for
 * the synth system to function. It runs once when the library is imported.
 */

import { transformRegistry } from './transforms/TransformRegistry';
import { transformFactory } from './transforms/TransformFactory';
import { ALL_TRANSFORMS } from './transforms/categories';
import { SynthSource } from './core/SynthSource';
import { initArrayUtils } from './utils/ArrayUtils';

// Extend Array.prototype with array utils
initArrayUtils();

// Register all built-in transforms with the registry
transformRegistry.registerMany(ALL_TRANSFORMS);

// Set up the SynthSource class for method injection
transformFactory.setSynthSourceClass(SynthSource);

// Inject chainable methods into SynthSource prototype
transformFactory.injectMethods(SynthSource.prototype);

/**
 * Generated standalone functions for source transforms (e.g., osc(), noise())
 */
export const generatedFunctions = transformFactory.generateStandaloneFunctions();
