/**
 * Synth dispose lifecycle callback.
 *
 * Cleans up synth resources when a layer is disposed.
 */

import type { TextmodeLayer } from 'textmode.js';
import { deleteLayerSynthState, getLayerSynthState } from './layerState';

/**
 * Clean up synth resources when a layer is disposed.
 */
export function synthDispose(layer: TextmodeLayer): void {
	const state = getLayerSynthState(layer);
	if (state) {
		state.isDisposed = true;
		state.shader?.dispose();
		state.pendingShader?.dispose();
		if (state.pingPongBuffers) {
			state.pingPongBuffers[0].dispose();
			state.pingPongBuffers[1].dispose();
		}
		deleteLayerSynthState(layer);
	}
}
