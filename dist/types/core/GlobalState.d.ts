/**
 * Global state for textmode.synth.js.
 *
 * This module maintains global configuration that affects all layers,
 * such as the master BPM for array modulation timing.
 */
/**
 * Set the global BPM for all layers.
 *
 * This sets the master tempo for array cycling. Layers will use this value
 * unless they have a layer-specific BPM set via layer.bpm().
 *
 * @param value - BPM value (beats per minute)
 *
 * @example
 * ```typescript
 * // Set global tempo to 120 BPM (2 beats per second)
 * t.bpm(120);
 *
 * // All layers will now cycle through arrays at this speed
 * t.layers.base.synth(osc([1, 2, 4, 8])); // Cycles twice as fast as default
 * ```
 */
export declare function setGlobalBpm(value: number): void;
/**
 * Get the current global BPM.
 * @returns Current global BPM value
 */
export declare function getGlobalBpm(): number;
//# sourceMappingURL=GlobalState.d.ts.map