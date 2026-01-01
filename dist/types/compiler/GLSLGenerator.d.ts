/**
 * GLSLGenerator - Generates GLSL shader code from compiled data.
 *
 * This module is responsible for assembling the final GLSL fragment
 * shader from collected functions, uniforms, and main code.
 */
import type { SynthUniform, CharacterMapping } from '../core/types';
import type { ExternalTextureInfo } from './types';
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
    /** Whether primary color feedback (src/prev) is used */
    usesFeedback?: boolean;
    /** Whether character feedback (charSrc) is used */
    usesCharFeedback?: boolean;
    /** Whether cell color feedback (cellColorSrc) is used */
    usesCellColorFeedback?: boolean;
    /** External layer texture references */
    externalTextures?: ExternalTextureInfo[];
}
/**
 * Generate the complete fragment shader.
 */
export declare function generateFragmentShader(options: ShaderGenerationOptions): string;
/**
 * Generate character output code based on chain result.
 */
export declare function generateCharacterOutputCode(hasCharVar: boolean, charVar: string, colorVar: string): string;
/**
 * Vertex shader source for synth rendering.
 */
export declare const SYNTH_VERTEX_SHADER = "#version 300 es\nprecision highp float;\n\n// Use explicit layout location for cross-platform compatibility\nlayout(location = 0) in vec2 a_position;\n\nout vec2 v_uv;\n\nvoid main() {\n\tvec2 uv = a_position * 0.5 + 0.5;\n\tv_uv = vec2(uv.x, 1.0 - uv.y);\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n}\n";
//# sourceMappingURL=GLSLGenerator.d.ts.map