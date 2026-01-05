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
		 * directly to the layer's draw framebuffer before the draw callback runs.
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
		 */
		bpm(value: number): void;

		/**
		 * Get the unique identifier for this layer.
		 *
		 * @returns The layer's unique identifier
		 */
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
		 */
		bpm(value: number): number;
	}
}
