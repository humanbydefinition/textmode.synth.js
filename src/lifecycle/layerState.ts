import type { TextmodeLayer } from 'textmode.js';
import type { LayerSynthState } from '../core/types';

const states = new WeakMap<TextmodeLayer, LayerSynthState>();

export function getLayerSynthState(layer: TextmodeLayer): LayerSynthState | undefined {
	return states.get(layer);
}

export function setLayerSynthState(layer: TextmodeLayer, state: LayerSynthState): void {
	states.set(layer, state);
}

export function deleteLayerSynthState(layer: TextmodeLayer): void {
	states.delete(layer);
}
