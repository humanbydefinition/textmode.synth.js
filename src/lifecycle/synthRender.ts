/**
 * Synth render lifecycle callback.
 *
 * Handles rendering of synth sources with atomic parameter validation
 * to prevent WebGL errors from incomplete uniform state.
 */

import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodeFont } from 'textmode.js/loadables';
import type { TextmodeFramebuffer } from 'textmode.js';
import { PLUGIN_NAME } from '../plugin/constants';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { collectExternalLayerRefs } from '../utils';
import { getGlobalBpm } from '../core/GlobalState';
import type { SynthContext, LayerSynthState } from '../core/types';

/**
 * Render synth source to layer framebuffers.
 *
 * Uses an atomic render pattern: all dynamic parameters are validated
 * BEFORE any WebGL operations. If any parameter fails, the entire frame
 * is skipped and the error propagates for the environment to handle.
 */
export async function synthRender(layer: TextmodeLayer, textmodifier: any) {
	const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
	if (!state) return;

	const grid = layer.grid;
	const drawFramebuffer = layer.drawFramebuffer;

	if (!grid || !drawFramebuffer) {
		// Layer not yet initialized
		return;
	}

	let justCollected = false;

	// Lazy compile on first render
	if (!state.compiled) {
		state.compiled = compileSynthSource(state.source);
		state.externalLayerMap = collectExternalLayerRefs(state.source);
		justCollected = true;
		state.needsCompile = true;
	}

	// Compile shader if needed
	if (state.needsCompile && state.compiled) {
		// Dispose old shader
		if (state.shader?.dispose) {
			state.shader.dispose();
		}

		// Collect external layer references from source
		if (!justCollected) {
			state.externalLayerMap = collectExternalLayerRefs(state.source);
		}

		// Use createFilterShader - leverages the instanced vertex shader
		state.shader = await textmodifier.createFilterShader(state.compiled.fragmentSource);
		state.needsCompile = false;
	}

	if (!state.shader || !state.compiled) return;

	// Determine feedback usage
	const usesFeedback = state.compiled.usesCharColorFeedback;
	const usesCharFeedback = state.compiled.usesCharFeedback;
	const usesCellColorFeedback = state.compiled.usesCellColorFeedback;
	const usesAnyFeedback = usesFeedback || usesCharFeedback || usesCellColorFeedback;

	// Create ping-pong buffers for feedback
	if (usesAnyFeedback && !state.pingPongBuffers) {
		state.pingPongBuffers = [
			textmodifier.createFramebuffer({ width: grid.cols, height: grid.rows, attachments: 3 }),
			textmodifier.createFramebuffer({ width: grid.cols, height: grid.rows, attachments: 3 }),
		] as [TextmodeFramebuffer, TextmodeFramebuffer];
		state.pingPongIndex = 0;
	}

	// Build synth context
	const synthContext: SynthContext = {
		time: textmodifier.secs,
		frameCount: textmodifier.frameCount,
		width: grid.width,
		height: grid.height,
		cols: grid.cols,
		rows: grid.rows,
		bpm: state.bpm ?? getGlobalBpm(),
		onError: state.onDynamicError,
	};

	// Evaluate dynamic parameters with graceful error handling.
	// On error: report via callback, use fallback value, continue rendering.
	const dynamicValues = new Map<string, number | number[]>();

	for (const [name, updater] of state.compiled.dynamicUpdaters) {
		const value = updater(synthContext);
		dynamicValues.set(name, value);
	}

	// Apply uniforms and render
	const applyUniforms = (feedbackBuffer: TextmodeFramebuffer | null) => {
		textmodifier.setUniform('time', textmodifier.frameCount / textmodifier.targetFrameRate());
		textmodifier.setUniform('resolution', [synthContext.cols, synthContext.rows]);

		for (const [name, value] of dynamicValues) {
			textmodifier.setUniform(name, value);
		}

		// Static uniforms
		for (const [name, uniform] of state.compiled!.uniforms) {
			if (!uniform.isDynamic && typeof uniform.value !== 'function') {
				textmodifier.setUniform(name, uniform.value);
			}
		}

		// Character mapping uniforms
		if (state.compiled!.charMapping) {
			const indices = state.characterResolver.resolve(
				state.compiled!.charMapping.chars,
				layer.font as TextmodeFont
			);
			textmodifier.setUniform('u_charMap', indices);
			textmodifier.setUniform('u_charMapSize', indices.length);
		}

		// Char source count uniform (for char() function)
		if (state.compiled!.usesCharSource) {
			// Priority: charMap length > font character count
			const charCount = state.compiled!.charMapping
				? state.compiled!.charMapping.chars.length
				: (layer.font as TextmodeFont).characters.length;
			textmodifier.setUniform('u_charSourceCount', charCount);
		}

		// Feedback texture uniforms
		if (feedbackBuffer) {
			if (usesFeedback) {
				textmodifier.setUniform('prevCharColorBuffer', feedbackBuffer.textures[1]);
			}
			if (usesCharFeedback) {
				textmodifier.setUniform('prevCharBuffer', feedbackBuffer.textures[0]);
			}
			if (usesCellColorFeedback) {
				textmodifier.setUniform('prevCellColorBuffer', feedbackBuffer.textures[2]);
			}
		}

		// External layer texture uniforms
		const externalLayers = state.compiled!.externalLayers;
		if (externalLayers && externalLayers.size > 0 && state.externalLayerMap) {
			for (const [layerId, info] of externalLayers) {
				const extLayer = state.externalLayerMap.get(layerId);
				if (!extLayer) {
					console.warn(`[textmode.synth.js] External layer not found: ${layerId}`);
					continue;
				}

				const extState = extLayer.getPluginState<LayerSynthState>(PLUGIN_NAME);
				let extTextures: any[] | undefined;

				if (extState?.pingPongBuffers) {
					const extReadBuffer = extState.pingPongBuffers[extState.pingPongIndex];
					extTextures = extReadBuffer.textures;
				} else if (extLayer.drawFramebuffer) {
					extTextures = extLayer.drawFramebuffer.textures;
				}

				if (extTextures) {
					if (info.usesChar) {
						textmodifier.setUniform(`${info.uniformPrefix}_char`, extTextures[0]);
					}
					if (info.usesCharColor) {
						textmodifier.setUniform(`${info.uniformPrefix}_primary`, extTextures[1]);
					}
					if (info.usesCellColor) {
						textmodifier.setUniform(`${info.uniformPrefix}_cell`, extTextures[2]);
					}
				}
			}
		}
	};

	// Execute render
	if (usesAnyFeedback && state.pingPongBuffers) {
		const readBuffer = state.pingPongBuffers[state.pingPongIndex];
		const writeBuffer = state.pingPongBuffers[1 - state.pingPongIndex];

		// Apply uniforms once
		textmodifier.shader(state.shader);
		applyUniforms(readBuffer);

		// Render to ping-pong write buffer
		writeBuffer.begin();
		textmodifier.clear();
		textmodifier.rect(grid.cols, grid.rows);
		writeBuffer.end();

		// Render to draw framebuffer
		drawFramebuffer.begin();
		textmodifier.clear();
		textmodifier.rect(grid.cols, grid.rows);
		drawFramebuffer.end();

		// Swap ping-pong index
		state.pingPongIndex = 1 - state.pingPongIndex;
	} else {
		// No feedback - render directly
		drawFramebuffer.begin();
		textmodifier.clear();
		textmodifier.shader(state.shader);
		applyUniforms(null);
		textmodifier.rect(grid.cols, grid.rows);
		drawFramebuffer.end();
	}
}
