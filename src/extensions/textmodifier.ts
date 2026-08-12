/**
 * Textmodifier extensions.
 *
 * Provides synth-related methods on the main Textmodifier instance:
 * - `bpm()` - Set BPM for array modulation (per-instance)
 * - `seed()` - Set seed for deterministic randomness (per-instance)
 */

import type { TextmodePluginContext } from 'textmode.js';
import type { Textmodifier } from 'textmode.js';
import type { SynthSource } from '../core/SynthSource';

/**
 * Per-textmodifier synth plugin state.
 */
export interface SynthPluginState {
	/** BPM for array modulation timing (default: 60) */
	bpm: number;
	/** Seed for deterministic randomness (null = time-based, non-deterministic) */
	seed: number | null;
}

const states = new WeakMap<Textmodifier, SynthPluginState>();

/**
 * Get the synth plugin state from a textmodifier, creating if needed.
 */
export function getSynthState(textmodifier: Textmodifier): SynthPluginState {
	let state = states.get(textmodifier);
	if (!state) {
		state = { bpm: 60, seed: null };
		states.set(textmodifier, state);
	}
	return state;
}

/** Remove the synth state owned by one Textmodifier installation. */
export function clearSynthState(textmodifier: Textmodifier): void {
	states.delete(textmodifier);
}

/**
 * Get the BPM from a textmodifier instance.
 */
export function getInstanceBpm(textmodifier: Textmodifier): number {
	return getSynthState(textmodifier).bpm;
}

/**
 * Get the seed from a textmodifier instance.
 */
export function getInstanceSeed(textmodifier: Textmodifier): number | null {
	return getSynthState(textmodifier).seed;
}

/**
 * Extend textmodifier with bpm() method.
 */
export function extendTextmodifierBpm(api: TextmodePluginContext): void {
	api.defineExtension('textmodifier', 'bpm', {
		value: function (this: Textmodifier, value: number): number {
			getSynthState(this).bpm = value;
			return value;
		},
	});
}

/**
 * Extend textmodifier with seed() method.
 */
export function extendTextmodifierSeed(api: TextmodePluginContext): void {
	api.defineExtension('textmodifier', 'seed', {
		value: function (this: Textmodifier, value: number | null): number | null {
			getSynthState(this).seed = value;
			return value;
		},
	});
}

/**
 * Extend textmodifier with synth() method — convenience shortcut
 * for `t.synth(source)`.
 */
export function extendTextmodifierSynth(api: TextmodePluginContext): void {
	api.defineExtension('textmodifier', 'synth', {
		value: function (this: Textmodifier, source: SynthSource | (() => SynthSource)): void {
			this.layers.base.synth(source);
		},
	});
}
