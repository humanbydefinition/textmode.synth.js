/**
 * Bootstrap module - Initializes the synth system on import.
 *
 * This module handles all side-effect initialization required for
 * the synth system to function. It runs once when the library is imported.
 *
 * Built-in transforms are installed through the default {@link SynthRuntime},
 * the same path custom extensions use, so there is no parallel "custom
 * transform compiler".
 */

import { createDefaultRuntime } from './runtime/createDefaultRuntime';
import { initArrayUtils } from './utils/ArrayUtils';

// Extend Array.prototype with array utils
initArrayUtils();

// Construct the default runtime and install built-ins through it.
createDefaultRuntime();
