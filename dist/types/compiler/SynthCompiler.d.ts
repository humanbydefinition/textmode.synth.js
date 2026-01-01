/**
 * SynthCompiler - Compiles SynthSource chains into MRT GLSL shaders.
 *
 * This compiler takes a SynthSource chain and produces a GLSL fragment shader
 * that outputs to textmode.js's triple-target MRT rendering:
 *   - Target 0: Character data (indexLow, indexHigh, packedFlags, rotation)
 *   - Target 1: Primary/foreground color (RGBA)
 *   - Target 2: Secondary/cell background color (RGBA)
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
export type { CompiledSynthShader } from './types';
//# sourceMappingURL=SynthCompiler.d.ts.map