/**
 * Compiler types and interfaces.
 */
import type { SynthUniform, SynthContext, CharacterMapping } from '../core/types';
import type { ExternalOutputRef } from '../core/SynthSource';
/**
 * Information about an external layer texture used in a shader.
 */
export interface ExternalTextureInfo {
    /** Unique sampler name in GLSL */
    samplerName: string;
    /** The output reference */
    outputRef: ExternalOutputRef;
    /** Texture unit assignment (determined at render time) */
    textureUnit?: number;
}
/**
 * Result of compiling a SynthSource.
 */
export interface CompiledSynthShader {
    /** Complete fragment shader source */
    fragmentSource: string;
    /** Uniform definitions with their values/updaters */
    uniforms: Map<string, SynthUniform>;
    /** Dynamic uniform updaters keyed by uniform name */
    dynamicUpdaters: Map<string, (ctx: SynthContext) => number | number[]>;
    /** Character mapping if charMap was used */
    charMapping?: CharacterMapping;
    /** Whether this shader uses self-feedback (src/prev without external ref) - reads from prevBuffer */
    usesFeedback: boolean;
    /** Whether this shader uses self character feedback (charSrc without external ref) - reads from prevCharBuffer */
    usesCharFeedback: boolean;
    /** Whether this shader uses self cell color feedback (cellColorSrc without external ref) - reads from prevCellColorBuffer */
    usesCellColorFeedback: boolean;
    /** External layer textures referenced in this shader */
    externalTextures: ExternalTextureInfo[];
}
/**
 * Intermediate representation node for a transform.
 */
export interface IRNode {
    /** Transform name */
    name: string;
    /** Resolved argument strings (GLSL literals or uniform names) */
    args: string[];
    /** Transform type */
    type: string;
    /** Reference to nested source result (for combine operations) */
    nestedColorVar?: string;
}
/**
 * Result from compiling a chain.
 */
export interface ChainCompilationResult {
    /** Current coordinate variable name */
    coordVar: string;
    /** Current color variable name */
    colorVar: string;
    /** Character output variable (if any) */
    charVar?: string;
    /** Flags variable (if any) */
    flagsVar?: string;
    /** Rotation variable (if any) */
    rotationVar?: string;
}
/**
 * Context for code generation.
 */
export interface GenerationContext {
    /** Counter for unique variable names */
    varCounter: number;
    /** Accumulated GLSL function definitions */
    glslFunctions: Set<string>;
    /** Accumulated main code lines */
    mainCode: string[];
    /** Collected uniforms */
    uniforms: Map<string, SynthUniform>;
    /** Dynamic uniform updaters */
    dynamicUpdaters: Map<string, (ctx: SynthContext) => number | number[]>;
}
//# sourceMappingURL=types.d.ts.map