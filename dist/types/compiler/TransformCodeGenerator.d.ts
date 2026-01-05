/**
 * TransformCodeGenerator - Generates GLSL code for individual transforms.
 *
 * This module handles the code generation logic for each transform type,
 * including context-aware function naming for src() operations.
 */
import type { ProcessedTransform } from '../transforms/TransformDefinition';
import type { CompilationTarget } from './types';
import type { ExternalLayerReference } from '../core/types';
/**
 * Result of generating code for a transform.
 */
export interface TransformCodeResult {
    /** The color variable name after this transform */
    colorVar: string;
    /** The character variable name (if modified) */
    charVar?: string;
    /** The flags variable name (if modified) */
    flagsVar?: string;
    /** The rotation variable name (if modified) */
    rotationVar?: string;
}
/**
 * Generates GLSL code for individual transforms.
 *
 * Handles:
 * - Source generators (src, osc, noise, etc.)
 * - Coordinate transforms (rotate, scale, etc.)
 * - Color transforms (brightness, contrast, etc.)
 * - Combine operations (add, mult, blend, etc.)
 * - CombineCoord operations (modulate, modulateScale, etc.)
 * - Character modifiers (charFlipX, charRotate, etc.)
 */
export declare class TransformCodeGenerator {
    /**
     * Generate a context-aware GLSL function for src().
     *
     * When the transform is 'src', this generates a context-specific GLSL function
     * that samples the appropriate texture based on the current compilation target:
     * - char context → samples prevCharBuffer
     * - charColor/main context → samples prevCharColorBuffer (primary color)
     * - cellColor context → samples prevCellColorBuffer
     *
     * For external layer references, generates a function that samples from
     * the external layer's texture uniforms.
     *
     * @param def - The processed transform definition
     * @param name - The transform name
     * @param currentTarget - The current compilation target
     * @param externalRef - Optional external layer reference
     * @param getExternalPrefix - Function to get external layer uniform prefix
     * @returns The GLSL function code
     */
    getContextAwareGlslFunction(def: ProcessedTransform, name: string, currentTarget: CompilationTarget, externalRef?: ExternalLayerReference, getExternalPrefix?: (layerId: string) => string): string;
    /**
     * Get the function name to call for a transform.
     * Handles context-aware naming for src() operations.
     */
    getFunctionName(def: ProcessedTransform, currentTarget: CompilationTarget, externalRef?: ExternalLayerReference, getExternalPrefix?: (layerId: string) => string): string;
    /**
     * Generate GLSL code for a transform and append to mainCode.
     *
     * @param mainCode - Array to append generated code lines
     * @param def - The processed transform definition
     * @param varId - Unique variable ID for this transform
     * @param coordVar - Current coordinate variable name
     * @param colorVar - Current color variable name
     * @param charVar - Current character variable name (if any)
     * @param flagsVar - Current flags variable name (if any)
     * @param rotationVar - Current rotation variable name (if any)
     * @param args - Processed argument strings
     * @param currentTarget - Current compilation target
     * @param nestedColorVar - Nested source color variable (for combine ops)
     * @param externalRef - External layer reference (if any)
     * @param getExternalPrefix - Function to get external layer prefix
     * @returns The transform code result with updated variable names
     */
    generateTransformCode(mainCode: string[], def: ProcessedTransform, varId: number, coordVar: string, colorVar: string, charVar: string | undefined, flagsVar: string | undefined, rotationVar: string | undefined, args: string[], currentTarget: CompilationTarget, nestedColorVar?: string, externalRef?: ExternalLayerReference, getExternalPrefix?: (layerId: string) => string): TransformCodeResult;
    /**
     * Generate GLSL function for external layer src().
     */
    private _generateExternalSrcFunction;
    /**
     * Generate GLSL function for self-feedback src().
     */
    private _generateSelfFeedbackSrcFunction;
}
//# sourceMappingURL=TransformCodeGenerator.d.ts.map