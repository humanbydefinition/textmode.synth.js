/**
 * Core types for the textmode.js synthesis system.
 *
 * This module contains foundational type definitions used throughout
 * the synth engine, including transform types, parameter values,
 * context interfaces, and shader compilation types.
 */
import { SynthSource } from "./SynthSource";
import type { SynthOutput } from "./SynthOutput";
/**
 * Transform type categories determining how functions compose in the shader pipeline.
 *
 * Each type has specific input/output signatures:
 * - `src`: Source generators that produce colors from UV coordinates
 * - `coord`: Coordinate transforms that modify UV before sampling
 * - `color`: Color transforms that modify existing color values
 * - `combine`: Blending operations that combine two color sources
 * - `combineCoord`: Modulation that uses one source to affect another's coordinates
 * - `char`: Character source generators for textmode
 * - `charModify`: Character property modifiers (flip, rotate, invert)
 * - `charColor`: Character foreground color sources
 * - `cellColor`: Cell/background color sources
 */
export type SynthTransformType = 'src' | 'coord' | 'color' | 'combine' | 'combineCoord' | 'char' | 'charModify' | 'charColor' | 'cellColor';
/**
 * GLSL type for transform inputs.
 */
export type GLSLType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'int' | 'sampler2D';
/**
 * Input parameter definition for a transform function.
 */
export interface TransformInput {
    /** Parameter name used in GLSL and JS API */
    name: string;
    /** GLSL type */
    type: GLSLType;
    /** Default value if not provided */
    default: number | number[] | null;
}
/**
 * Dynamic parameter value types supported by the synth system.
 *
 * - `number`: Static numeric value
 * - `number[]`: Array of numbers for vector types or modulated arrays (Hydra-style)
 * - `string`: String value (rarely used)
 * - `function`: Evaluated each frame with context
 * - `SynthSource`: Nested synth chain for combine/modulate operations
 * - `SynthOutput`: Reference to another layer's output (for cross-layer feedback)
 * - `null`: Use default value
 */
export type SynthParameterValue = number | number[] | string | ((ctx: SynthContext) => number) | ((ctx: SynthContext) => number[]) | SynthSource | SynthOutput | null;
/**
 * Context passed to dynamic parameter functions during rendering.
 */
export interface SynthContext {
    /** Current time in seconds */
    time: number;
    /** Current frame count */
    frameCount: number;
    /** Canvas/grid width in pixels */
    width: number;
    /** Canvas/grid height in pixels */
    height: number;
    /** Grid columns */
    cols: number;
    /** Grid rows */
    rows: number;
    /** Normalized mouse X (0-1) */
    mouseX: number;
    /** Normalized mouse Y (0-1) */
    mouseY: number;
}
/**
 * Character set mapping for charMap transform.
 */
export interface CharacterMapping {
    /** The character string to use */
    chars: string;
    /** Pre-computed character code points */
    indices: number[];
}
/**
 * Uniform definition for compiled shaders.
 */
export interface SynthUniform {
    /** Uniform name in GLSL */
    name: string;
    /** GLSL type */
    type: GLSLType;
    /** Current value */
    value: number | number[];
    /** Whether this uniform is dynamically updated each frame */
    isDynamic: boolean;
}
/**
 * Return type signature lookup for each transform type.
 */
export declare const TRANSFORM_TYPE_INFO: Record<SynthTransformType, {
    returnType: string;
    args: Array<{
        type: string;
        name: string;
    }>;
}>;
/**
 * Create a CharacterMapping from a string of characters.
 */
export declare function createCharacterMapping(chars: string): CharacterMapping;
//# sourceMappingURL=types.d.ts.map