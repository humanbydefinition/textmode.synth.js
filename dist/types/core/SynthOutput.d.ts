/**
 * SynthOutput - Represents a reference to a layer's output buffers.
 *
 * In Hydra, `o0`, `o1`, etc. are output references that can be passed to `src()`.
 * In textmode.synth.js, a SynthOutput represents a TextmodeLayer's three output
 * textures (character, primary color, cell color).
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, src, osc, noise, createOutput } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * const layer0 = t.layers.add();
 * const layer1 = t.layers.add();
 *
 * // Create output references
 * const o0 = createOutput(layer0);
 * const o1 = createOutput(layer1);
 *
 * // Reference layer0's output in layer1's synth
 * layer1.synth(
 *   src(o0).modulate(noise(3), 0.01).blend(osc(10), 0.1)
 * );
 *
 * // Reference layer1's output in layer0's synth
 * layer0.synth(
 *   noise(3).layer(src(o1).luma())
 * );
 * ```
 */
/**
 * Represents a reference to a layer's output buffers.
 *
 * A SynthOutput encapsulates a layer reference that can be passed to
 * `src()`, `charSrc()`, or `cellColorSrc()` to sample from that layer's
 * previous frame output.
 */
export declare class SynthOutput {
    /** Unique identifier for this output (used in shader uniform naming) */
    readonly id: string;
    /** The layer this output references (will be set by the plugin) */
    private _layer?;
    /**
     * Whether this is a "self" reference (current layer's own previous frame).
     * When true, uses the ping-pong buffers instead of external layer textures.
     */
    readonly isSelf: boolean;
    /**
     * Create a new SynthOutput.
     * @param id Unique identifier for this output
     * @param isSelf Whether this references the current layer (default: false)
     */
    constructor(id: string, isSelf?: boolean);
    /**
     * Set the layer reference.
     * Called by the plugin when the output is registered.
     * @internal
     */
    setLayer(layer: unknown): void;
    /**
     * Get the layer reference.
     * @internal
     */
    getLayer(): unknown;
    /**
     * Check if this output has a layer assigned.
     */
    hasLayer(): boolean;
}
/**
 * Special singleton representing "self" - the current layer's own previous frame.
 * This is what `src()` without arguments uses internally.
 */
export declare const SELF_OUTPUT: SynthOutput;
/**
 * Create a SynthOutput reference for a layer.
 *
 * @param layer The TextmodeLayer to create an output reference for
 * @returns A SynthOutput that can be passed to src(), charSrc(), or cellColorSrc()
 *
 * @example
 * ```typescript
 * const layer1 = t.layers.add();
 * const o1 = createOutput(layer1);
 *
 * // Use in another layer's synth
 * layer0.synth(src(o1).blend(osc(10), 0.5));
 * ```
 */
export declare function createOutput(layer: unknown): SynthOutput;
/**
 * Type guard to check if a value is a SynthOutput.
 */
export declare function isSynthOutput(value: unknown): value is SynthOutput;
//# sourceMappingURL=SynthOutput.d.ts.map