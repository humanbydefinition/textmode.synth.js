import type { SynthParameterValue, CharacterMapping } from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import { ISynthSource } from './ISynthSource';
import { SynthOutput } from './SynthOutput';
/**
 * Represents an external output reference in a synth chain.
 * Tracks which output is referenced and what type of texture to sample.
 */
export interface ExternalOutputRef {
    /** The SynthOutput being referenced */
    output: SynthOutput;
    /** Which texture to sample: 'color' | 'char' | 'cellColor' */
    textureType: 'color' | 'char' | 'cellColor';
    /** The transform name that uses this reference */
    transformName: string;
    /** Index in the transform chain where this reference is used */
    transformIndex: number;
}
/**
 * Options for creating a new SynthSource.
 * @internal
 */
interface SynthSourceCreateOptions {
    chain?: SynthChain;
    charMapping?: CharacterMapping;
    colorSource?: SynthSource;
    cellColorSource?: SynthSource;
    nestedSources?: Map<number, SynthSource>;
    externalOutputs?: ExternalOutputRef[];
}
/**
 * A chainable synthesis source that accumulates transforms to be compiled into a shader.
 *
 * This is the core class that enables hydra-like method chaining for
 * generating procedural textmode visuals. Each method call adds a
 * transform to the chain, which is later compiled into a GLSL shader.
 *
 * @example
 * ```ts
 * // Create a synth chain with procedural characters and colors
 * const chain = charNoise(10)
 *   .charMap('@#%*+=-:. ')
 *   .charRotate(0.1)
 *   .charColor(osc(5).kaleid(4))
 *   .scroll(0.1, 0);
 * ```
 */
export declare class SynthSource implements ISynthSource {
    /** The immutable chain of transforms */
    private readonly _chain;
    /** Character mapping for charMap transform */
    private _charMapping?;
    /** Nested sources for combine operations (indexed by transform position) */
    private readonly _nestedSources;
    /** Reference to the color source chain (if any) */
    private _colorSource?;
    /** Reference to the cell color source chain (if any) */
    private _cellColorSource?;
    /** External output references used in this chain (for cross-layer feedback) */
    private readonly _externalOutputs;
    /**
     * Create a new SynthSource.
     * @param options Optional initialization options
     * @ignore Use generator functions like `osc()`, `noise()` instead
     */
    constructor(options?: SynthSourceCreateOptions);
    /**
     * Add a transform to the chain.
     * This method is called by dynamically injected transform methods.
     * @ignore
     */
    addTransform(name: string, userArgs: SynthParameterValue[]): this;
    /**
     * Add a combine transform that references another source.
     * @ignore
     */
    addCombineTransform(name: string, source: SynthSource, userArgs: SynthParameterValue[]): this;
    charMap(chars: string): this;
    charColor(source: SynthSource): this;
    cellColor(source: SynthSource): this;
    paint(source: SynthSource): this;
    clone(): SynthSource;
    /**
     * Get the transform records.
     * @ignore
     */
    get transforms(): readonly TransformRecord[];
    /**
     * Get the character mapping if defined.
     * @ignore
     */
    get charMapping(): CharacterMapping | undefined;
    /**
     * Get the color source if defined.
     * @ignore
     */
    get colorSource(): SynthSource | undefined;
    /**
     * Get the cell color source if defined.
     * @ignore
     */
    get cellColorSource(): SynthSource | undefined;
    /**
     * Get all nested sources for combine operations.
     * @ignore
     */
    get nestedSources(): Map<number, SynthSource>;
    /**
     * Get all external output references used in this chain.
     * Used by the compiler to set up cross-layer texture sampling.
     * @ignore
     */
    get externalOutputs(): readonly ExternalOutputRef[];
    /**
     * Collect all external outputs from this source and its nested sources.
     * @ignore
     */
    collectAllExternalOutputs(): ExternalOutputRef[];
}
export {};
//# sourceMappingURL=SynthSource.d.ts.map