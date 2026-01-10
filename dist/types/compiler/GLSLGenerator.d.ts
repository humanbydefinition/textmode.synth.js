/**
 * GLSLGenerator - Generates GLSL shader code from compiled data.
 *
 * This module is responsible for assembling the final GLSL fragment
 * shader from collected functions, uniforms, and main code.
 */
import type { SynthUniform, CharacterMapping } from '../core/types';
import type { ExternalLayerInfo } from './types';
/**
 * Options for shader generation.
 */
export interface ShaderGenerationOptions {
    /** Uniform declarations */
    uniforms: Map<string, SynthUniform>;
    /** GLSL function definitions */
    glslFunctions: Set<string>;
    /** Main function code lines */
    mainCode: string[];
    /** Character output code */
    charOutputCode: string;
    /** Primary color variable name */
    primaryColorVar: string;
    /** Cell color variable name */
    cellColorVar: string;
    /** Character mapping (if any) */
    charMapping?: CharacterMapping;
    /** Whether primary color feedback (src) is used */
    usesFeedback?: boolean;
    /** Whether character feedback (src) is used */
    usesCharFeedback?: boolean;
    /** Whether cell color feedback (src) is used */
    usesCellColorFeedback?: boolean;
    /** Whether char() function is used */
    usesCharSource?: boolean;
    /** External layer references used in this shader */
    externalLayers?: Map<string, ExternalLayerInfo>;
}
/**
 * Generate the complete fragment shader.
 */
export declare function generateFragmentShader(options: ShaderGenerationOptions): string;
/**
 * Generate character output code based on chain result.
 */
export declare function generateCharacterOutputCode(hasCharVar: boolean, charVar: string, colorVar: string): string;
//# sourceMappingURL=GLSLGenerator.d.ts.map