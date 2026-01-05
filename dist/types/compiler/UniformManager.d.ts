import type { SynthParameterValue, SynthContext, SynthUniform } from '../core/types';
import type { TransformInput } from '../transforms/TransformDefinition';
/**
 * Result of processing a single argument.
 */
export interface ProcessedArgument {
    /** GLSL code to use in function call */
    glslValue: string;
    /** Uniform created (if any) */
    uniform?: SynthUniform;
    /** Dynamic updater (if any) */
    updater?: (ctx: SynthContext) => number | number[];
}
/**
 * Handles uniform extraction and management.
 *
 * This module processes transform arguments and creates uniform
 * definitions for dynamic values that need to be updated each frame.
 */
export declare class UniformManager {
    private readonly _uniforms;
    private readonly _dynamicUpdaters;
    /**
     * Process an argument and return its GLSL representation.
     */
    processArgument(value: SynthParameterValue, input: TransformInput, prefix: string): ProcessedArgument;
    /**
     * Process default value for an input.
     */
    private processDefault;
    /**
     * Get all collected uniforms.
     */
    getUniforms(): Map<string, SynthUniform>;
    /**
     * Get all dynamic updaters.
     */
    getDynamicUpdaters(): Map<string, (ctx: SynthContext) => number | number[]>;
    /**
     * Clear all collected data.
     */
    clear(): void;
}
/**
 * Format a number for GLSL (ensure decimal point for floats).
 */
export declare function formatNumber(n: number): string;
//# sourceMappingURL=UniformManager.d.ts.map