/**
 * Transform definition types and interfaces.
 *
 * This module provides the base types and helper functions for defining
 * synthesis transforms in a declarative way.
 */
import type { SynthTransformType, TransformInput } from '../core/types';
export type { TransformInput };
/**
 * Definition of a synthesis transform function.
 */
export interface TransformDefinition {
    /** Function name (used in JS API and GLSL) */
    name: string;
    /** Transform type determining composition behavior */
    type: SynthTransformType;
    /** Input parameters */
    inputs: TransformInput[];
    /** GLSL function body (without function signature) */
    glsl: string;
    /** Optional description for documentation */
    description?: string;
}
/**
 * A processed transform with complete GLSL function.
 */
export interface ProcessedTransform extends TransformDefinition {
    /** Complete GLSL function code */
    glslFunction: string;
}
/**
 * Process a transform definition into a processed transform with complete GLSL function.
 */
export declare function processTransform(def: TransformDefinition): ProcessedTransform;
/**
 * Helper to define a transform with type inference.
 * This makes transform definitions more concise and type-safe.
 */
export declare function defineTransform<T extends SynthTransformType>(definition: TransformDefinition & {
    type: T;
}): TransformDefinition;
/**
 * Get default values for a transform's inputs.
 */
export declare function getDefaultArgs(def: TransformDefinition): (number | number[] | null)[];
/**
 * Check if a transform type requires a nested source.
 */
export declare function requiresNestedSource(type: SynthTransformType): boolean;
/**
 * Check if a transform type is a source generator.
 */
export declare function isSourceType(type: SynthTransformType): boolean;
//# sourceMappingURL=TransformDefinition.d.ts.map