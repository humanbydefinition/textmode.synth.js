/**
 * Core module exports.
 *
 * Provides the core types, classes, and state management for the synth engine.
 *
 * @module
 */

// Types
export * from './types';

// Classes
export { SynthChain, type TransformRecord } from './SynthChain';
export { SynthSource } from './SynthSource';

// Interfaces (for documentation)
export type { ISynthSource } from './ISynthSource';

// State
export { setGlobalBpm, getGlobalBpm } from './GlobalState';
export type { LayerSynthState } from './LayerSynthState';
