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
export * from './types';
export { compileSynthSource } from './SynthCompiler';
export type { CompiledSynthShader } from './SynthCompiler';
export { FeedbackTracker, type FeedbackUsage } from './FeedbackTracker';
export { ExternalLayerManager } from './ExternalLayerManager';
export { TransformCodeGenerator, type TransformCodeResult } from './TransformCodeGenerator';
export { UniformManager } from './UniformManager';
export * from './GLSLGenerator';
//# sourceMappingURL=index.d.ts.map