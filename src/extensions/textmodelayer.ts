/**
 * TextmodeLayer extensions.
 *
 * Provides synth-related methods on TextmodeLayer instances:
 * - `synth()` - Apply a synth source to the layer
 * - `clearSynth()` - Remove synth from the layer
 * - `bpm()` - Set layer-specific BPM override
 */

import type { TextmodePluginAPI } from 'textmode.js/plugins';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { SynthSource } from '../core/SynthSource';
import { SynthSource as SynthSourceClass } from '../core/SynthSource';
import { PLUGIN_NAME } from '../plugin/constants';
import type { LayerSynthState } from '../core/types';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { CharacterResolver } from '../utils/CharacterResolver';

/**
 * Create a new LayerSynthState with default values.
 *
 * This factory function eliminates duplication between extensions
 * that need to initialize layer state.
 *
 * @param partial - Partial state to override defaults
 * @returns A complete LayerSynthState object
 */
function createLayerSynthState(partial: Partial<LayerSynthState> = {}): LayerSynthState {
	return {
		source: partial.source ?? new SynthSourceClass(),
		sourceFactory: partial.sourceFactory,
		compiled: partial.compiled,
		shader: partial.shader,
		characterResolver: partial.characterResolver ?? new CharacterResolver(),
		needsCompile: partial.needsCompile ?? false,
		isCompiling: partial.isCompiling ?? false,
		pingPongBuffers: partial.pingPongBuffers,
		pingPongDimensions: partial.pingPongDimensions,
		pingPongIndex: partial.pingPongIndex ?? 0,
		externalLayerMap: partial.externalLayerMap,
		bpm: partial.bpm,
		dynamicValues: partial.dynamicValues ?? new Map(),
		synthContext: partial.synthContext ?? {
			time: 0,
			frameCount: 0,
			width: 0,
			height: 0,
			cols: 0,
			rows: 0,
			bpm: 0,
		},
		isDisposed: false,
	};
}

/**
 * Extend layer with synth() method.
 */
export function extendLayerSynth(api: TextmodePluginAPI): void {
	api.extendLayer('synth', function (this: TextmodeLayer, sourceOrFactory: SynthSource | (() => SynthSource)): void {
		const isInitialized = this.grid !== undefined && this.drawFramebuffer !== undefined;

		let source: SynthSource;
		let sourceFactory: (() => SynthSource) | undefined;

		if (typeof sourceOrFactory === 'function') {
			sourceFactory = sourceOrFactory;
			// Evaluate immediately if we can, or use an empty/default source if expected to fail?
			// Best strategy: Try to evaluate. If it fails (shouldn't if just composition), use result.
			// Actually, the WHOLE POINT is that it might depend on undefined variables.
			// So we CANNOT evaluate safely here if those variables are undefined.

			// We'll use a dummy source initially.
			// BUT, what if the user expects it to work immediately?
			// We will assume "lazy" implies "wait for render".
			source = new SynthSourceClass();
		} else {
			source = sourceOrFactory;
		}

		let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

		if (state) {
			// Update existing state
			state.source = source;
			state.sourceFactory = sourceFactory;
			state.needsCompile = true;
			state.characterResolver.invalidate();

			// Only compile immediately if we have a real source (not just a placeholder from factory)
			if (isInitialized && !sourceFactory) {
				state.compiled = compileSynthSource(source);
			}
		} else {
			// Create new state using factory
			state = createLayerSynthState({
				source,
				sourceFactory,
				compiled: (isInitialized && !sourceFactory) ? compileSynthSource(source) : undefined,
				needsCompile: true,
			});
		}

		this.setPluginState(PLUGIN_NAME, state);
	});
}

/**
 * Extend layer with clearSynth() method.
 */
export function extendLayerClearSynth(api: TextmodePluginAPI): void {
	api.extendLayer('clearSynth', function (this: TextmodeLayer): void {
		const state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);
		if (!state) return;

		// Dispose shader
		if (state.shader?.dispose) {
			state.shader.dispose();
		}

		// Dispose ping-pong buffers
		if (state.pingPongBuffers) {
			state.pingPongBuffers[0].dispose?.();
			state.pingPongBuffers[1].dispose?.();
		}

		// Clear plugin state
		this.setPluginState(PLUGIN_NAME, undefined);
	});
}

/**
 * Extend layer with bpm() method.
 */
export function extendLayerBpm(api: TextmodePluginAPI): void {
	api.extendLayer('bpm', function (this: TextmodeLayer, value: number): void {
		let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

		if (state) {
			// Update existing state
			state.bpm = value;
		} else {
			// Create minimal state to store BPM using factory
			state = createLayerSynthState({ bpm: value });
		}

		this.setPluginState(PLUGIN_NAME, state);
	});
}
