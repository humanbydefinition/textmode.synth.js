/**
 * Bootstrap module - Initializes the synth system on import.
 *
 * This module handles all side-effect initialization required for
 * the synth system to function. It runs once when the library is imported.
 *
 * @internal
 * @module
 */

import { transformRegistry } from './transforms/TransformRegistry';
import { transformFactory } from './transforms/TransformFactory';
import { ALL_TRANSFORMS } from './transforms/categories';
import { SynthSource } from './core/SynthSource';
import { initArrayUtils } from './utils/ArrayUtils';

// ============================================================
// ARRAY UTILITIES
// Extends Array.prototype with .fast(), .smooth(), .ease() methods
// ============================================================

initArrayUtils();

// ============================================================
// TRANSFORM REGISTRATION
// Register all built-in transforms with the registry
// ============================================================

transformRegistry.registerMany(ALL_TRANSFORMS);

// ============================================================
// METHOD INJECTION
// Inject chainable transform methods into SynthSource prototype
// ============================================================

// Set up the SynthSource class for method injection
transformFactory.setSynthSourceClass(SynthSource as unknown as new () => {
    addTransform(name: string, userArgs: unknown[]): unknown;
    addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
});

// Inject chainable methods into SynthSource prototype
transformFactory.injectMethods(SynthSource.prototype as unknown as {
    addTransform(name: string, userArgs: unknown[]): unknown;
    addCombineTransform(name: string, source: unknown, userArgs: unknown[]): unknown;
});

// ============================================================
// STANDALONE FUNCTION GENERATION
// Generate standalone functions for source transforms (e.g., osc(), noise())
// ============================================================

/**
 * Generated standalone functions for source-type transforms.
 * These allow starting a chain without explicitly creating a SynthSource.
 */
export const generatedFunctions = transformFactory.generateStandaloneFunctions();
