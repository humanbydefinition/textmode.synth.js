import type { SynthParameterValue, CharacterMapping, ExternalLayerReference } from './types';
import { SynthChain, type TransformRecord } from './SynthChain';
import type { ISynthSource } from './ISynthSource';
export interface SynthSource extends ISynthSource {
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
    charSource?: SynthSource;
    charCount?: number;
    nestedSources?: Map<number, SynthSource>;
    externalLayerRefs?: Map<number, ExternalLayerReference>;
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
 * const synth = noise(10)
 *   .rotate(0.1)
 *   .scroll(0.1, 0)
 *
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(osc(5).kaleid(4).invert())
 *
 *   .charMap('@#%*+=-:. ');
 * ```
 */
export declare class SynthSource {
    /** The immutable chain of transforms */
    private readonly _chain;
    /** Character mapping for charMap transform */
    private _charMapping?;
    /** Nested sources for combine operations (indexed by transform position) */
    private readonly _nestedSources;
    /** External layer references for cross-layer sampling (indexed by transform position) */
    private readonly _externalLayerRefs;
    /** Reference to the color source chain (if any) */
    private _colorSource?;
    /** Reference to the cell color source chain (if any) */
    private _cellColorSource?;
    /** Reference to the character source chain (if any) - used by char() function */
    private _charSource?;
    /** Number of unique characters when using char() function */
    private _charCount?;
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
    /**
     * Add an external layer reference at the current transform index.
     * Used by src(layer) to track cross-layer sampling.
     * @ignore
     */
    addExternalLayerRef(ref: ExternalLayerReference): this;
    charMap(chars: string): this;
    charColor(source: SynthSource): this;
    char(source: SynthSource, charCount: number): this;
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
     * Get the character source if defined (from char() function).
     * @ignore
     */
    get charSource(): SynthSource | undefined;
    /**
     * Get the character count if defined (from char() function).
     * @ignore
     */
    get charCount(): number | undefined;
    /**
     * Get all nested sources for combine operations.
     * @ignore
     */
    get nestedSources(): Map<number, SynthSource>;
    /**
     * Get all external layer references for cross-layer sampling.
     * @ignore
     */
    get externalLayerRefs(): Map<number, ExternalLayerReference>;
}
export {};
//# sourceMappingURL=SynthSource.d.ts.map