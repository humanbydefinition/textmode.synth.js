/**
 * SynthCompiler - Compiles SynthSource chains into MRT GLSL shaders.
 *
 * This compiler takes a SynthSource chain and produces a GLSL fragment shader
 * that outputs to textmode.js's triple-target MRT rendering:
 *   - Target 0: Character data (indexLow, indexHigh, packedFlags, rotation)
 *   - Target 1: Primary/foreground color (RGBA)
 *   - Target 2: Secondary/cell background color (RGBA)
 *
 * The compilation process is modular, delegating to:
 *   - FeedbackTracker: Manages feedback texture usage
 *   - ExternalLayerManager: Manages cross-layer sampling
 *   - TransformCodeGenerator: Generates GLSL for individual transforms
 *   - UniformManager: Manages shader uniforms
 *   - GLSLGenerator: Assembles the final shader
 */
import type { SynthSource } from '../core/SynthSource';
import type { CompiledSynthShader } from './types';
/**
 * Compile a SynthSource chain into a complete MRT GLSL shader.
 *
 * @param source The SynthSource chain to compile
 * @returns A compiled shader with fragment source and uniform definitions
 */
export declare function compileSynthSource(source: SynthSource): CompiledSynthShader;
//# sourceMappingURL=SynthCompiler.d.ts.map