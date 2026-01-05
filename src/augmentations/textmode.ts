/**
 * Type augmentations for textmode.js
 *
 * This module extends the TextmodeLayer and Textmodifier interfaces
 * when the textmode.synth.js package is imported.
 *
 * @module
 */

import type { SynthSource } from '../core/SynthSource';

declare module 'textmode.js' {
    interface TextmodeLayer {
        /**
         * Set a synth source for this layer.
         *
         * The synth will render procedurally generated characters and colors
         * directly to the layer's MRT framebuffer before the draw callback runs.
         *
         * @param source A SynthSource chain defining the procedural generation
         */
        synth(source: SynthSource): void;

        /**
         * Clear the synth from this layer.
         *
         * This disposes all synth-related resources including the compiled shader
         * and any ping-pong framebuffers used for feedback effects. After calling
         * this method, the layer will no longer render synth content.
         *
         * Use this to reset a layer's synth state without removing the layer itself.
         *
         * @example
         * ```typescript
         * // Apply a synth
         * t.layers.base.synth(osc(10));
         *
         * // Later, clear it
         * t.layers.base.clearSynth();
         * ```
         */
        clearSynth(): void;

        /**
         * Set layer-specific BPM override for array modulation timing.
         *
         * This overrides the global BPM set by `t.bpm()` for this specific layer,
         * allowing polyrhythmic compositions where different layers cycle at
         * different speeds.
         *
         * @param value BPM value (beats per minute) for this layer
         *
         * @example
         * ```typescript
         * import { SynthPlugin, osc } from 'textmode.synth.js';
         *
         * // Set global BPM to 120
         * t.bpm(120);
         *
         * // Base layer uses global BPM (120)
         * t.layers.base.synth(osc([1, 2, 4]));
         *
         * // Layer 2 runs at half speed (60 BPM)
         * const layer2 = t.layers.add();
         * layer2.bpm(60);
         * layer2.synth(osc([8, 16, 32]));
         * ```
         */
        bpm(value: number): void;

        get id(): string;
    }

    interface Textmodifier {
        /**
         * Set the global BPM (Beats Per Minute) for array modulation timing.
         *
         * This sets the master tempo for all layers. Individual layers can override
         * this with `layer.bpm(value)` for polyrhythmic compositions.
         *
         * In live coding, BPM controls how fast arrays cycle through their values.
         * By default, BPM is 60, meaning arrays advance 1 element per second.
         * At BPM 120, they advance 2 elements per second.
         *
         * @param value - BPM value (beats per minute)
         * @returns The BPM value that was set (for chaining)
         *
         * @example
         * ```typescript
         * import { textmode } from 'textmode.js';
         * import { SynthPlugin, osc, shape } from 'textmode.synth.js';
         *
         * const t = textmode.create({ plugins: [SynthPlugin] });
         *
         * // Set global tempo to 120 BPM (2 beats per second)
         * t.bpm(120);
         *
         * // All layers cycle through arrays at this speed by default
         * t.layers.base.synth(
         *   shape([3, 4, 5, 6]) // Cycles through shapes twice per second
         *     .rotate([0, 3.14].smooth())
         * );
         * ```
         */
        bpm(value: number): number;
    }
}
