/**
 * Compiler module exports.
 * 
 * The compiler system is modular, with responsibilities split across:
 * - SynthCompiler: Main compilation orchestration
 * - FeedbackTracker: Feedback texture usage tracking
 * - ExternalLayerManager: Cross-layer sampling management
 * - TransformCodeGenerator: Individual transform code generation
 * - UniformManager: Shader uniform handling
 * - GLSLGenerator: Final shader assembly
 */

// Types
export * from './types';

// Core compiler
export { compileSynthSource } from './SynthCompiler';
export type { CompiledSynthShader } from './SynthCompiler';

// Modular components
export { FeedbackTracker, type FeedbackUsage } from './FeedbackTracker';
export { ExternalLayerManager } from './ExternalLayerManager';
export { TransformCodeGenerator, type TransformCodeResult } from './TransformCodeGenerator';
export { UniformManager } from './UniformManager';

// GLSL generation
export * from './GLSLGenerator';
