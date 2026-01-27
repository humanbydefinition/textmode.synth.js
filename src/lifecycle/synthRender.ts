/**
 * Synth render lifecycle callback.
 *
 * Handles rendering of synth sources with atomic parameter validation
 * to prevent WebGL errors from incomplete uniform state.
 */

import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodeFont } from 'textmode.js/loadables';
import type { TextmodeFramebuffer, Textmodifier } from 'textmode.js';
import { PLUGIN_NAME } from '../plugin/constants';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { CHANNEL_SUFFIXES, CHANNEL_SAMPLERS } from '../core/constants';
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
export async function synthRender(layer: TextmodeLayer, textmodifier: Textmodifier) {
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

	// Manage ping-pong buffer lifecycle
	if (state.pingPongBuffers) {
		const dim = state.pingPongDimensions;
		const resizeNeeded = !dim || dim.cols !== grid.cols || dim.rows !== grid.rows;

		// Dispose if feedback is disabled OR grid dimensions changed
		if (!usesAnyFeedback || resizeNeeded) {
			state.pingPongBuffers[0].dispose();
			state.pingPongBuffers[1].dispose();
			state.pingPongBuffers = undefined;
			state.pingPongDimensions = undefined;
		}
	}

	// Create ping-pong buffers for feedback
	if (usesAnyFeedback && !state.pingPongBuffers) {
		state.pingPongBuffers = [
			textmodifier.createFramebuffer({ width: grid.cols, height: grid.rows, attachments: 3 }),
			textmodifier.createFramebuffer({ width: grid.cols, height: grid.rows, attachments: 3 }),
		] as [TextmodeFramebuffer, TextmodeFramebuffer];
		state.pingPongDimensions = { cols: grid.cols, rows: grid.rows };
		state.pingPongIndex = 0;
	}

	// Build or update synth context
	if (!state.synthContext) {
		state.synthContext = {
			time: 0,
			frameCount: 0,
			width: 0,
			height: 0,
			cols: 0,
			rows: 0,
			bpm: 0,
		};
	}

	const synthContext = state.synthContext;
	synthContext.time = textmodifier.secs;
	synthContext.frameCount = textmodifier.frameCount;
	synthContext.width = grid.width;
	synthContext.height = grid.height;
	synthContext.cols = grid.cols;
	synthContext.rows = grid.rows;
	synthContext.bpm = state.bpm ?? getGlobalBpm();
	synthContext.onError = state.onDynamicError;

	// Evaluate dynamic parameters with graceful error handling.
	// On error: report via callback, use fallback value, continue rendering.
	state.dynamicValues.clear();
	for (const [name, updater] of state.compiled.dynamicUpdaters) {
		const value = updater(synthContext);
		state.dynamicValues.set(name, value);
	}

	// Execute render
	if (usesAnyFeedback && state.pingPongBuffers) {
		const readBuffer = state.pingPongBuffers[state.pingPongIndex];
		const writeBuffer = state.pingPongBuffers[1 - state.pingPongIndex];

		// Render to ping-pong write buffer
		writeBuffer.begin();
		textmodifier.clear();
		textmodifier.shader(state.shader);
		applySynthUniforms(layer, textmodifier, state, synthContext, readBuffer);
		textmodifier.rect(grid.cols, grid.rows);
		writeBuffer.end();

		// Render to draw framebuffer
		drawFramebuffer.begin();
		textmodifier.clear();
		textmodifier.shader(state.shader);
		applySynthUniforms(layer, textmodifier, state, synthContext, readBuffer);
		textmodifier.rect(grid.cols, grid.rows);
		drawFramebuffer.end();

		// Swap ping-pong index
		state.pingPongIndex = 1 - state.pingPongIndex;
	} else {
		// No feedback - render directly
		drawFramebuffer.begin();
		textmodifier.clear();
		textmodifier.shader(state.shader);
		applySynthUniforms(layer, textmodifier, state, synthContext, null);
		textmodifier.rect(grid.cols, grid.rows);
		drawFramebuffer.end();
	}
}

/**
 * Apply uniforms to the shader.
 * Extracted to avoid per-frame closure allocation.
 */
function applySynthUniforms(
	layer: TextmodeLayer,
	textmodifier: Textmodifier,
	state: LayerSynthState,
	ctx: SynthContext,
	feedbackBuffer: TextmodeFramebuffer | null
) {
	textmodifier.setUniform('time', ctx.time);
	textmodifier.setUniform('resolution', [ctx.cols, ctx.rows]);

	for (const [name, value] of state.dynamicValues) {
		textmodifier.setUniform(name, value);
	}

	const compiled = state.compiled!;

	// Static uniforms
	for (const [name, uniform] of compiled.uniforms) {
		if (!uniform.isDynamic && typeof uniform.value !== 'function') {
			textmodifier.setUniform(name, uniform.value);
		}
	}

	// Character mapping uniforms
	if (compiled.charMapping) {
		const indices = state.characterResolver.resolve(
			compiled.charMapping.chars,
			layer.font as TextmodeFont
		);
		textmodifier.setUniform('u_charMap', indices);
		textmodifier.setUniform('u_charMapSize', indices.length);
	}

	// Char source count uniform (for char() function)
	if (compiled.usesCharSource) {
		// Priority: charMap length > font character count
		const charCount = compiled.charMapping
			? compiled.charMapping.chars.length
			: (layer.font as TextmodeFont).characters.length;
		textmodifier.setUniform('u_charSourceCount', charCount);
	}

	// Feedback texture uniforms
	if (feedbackBuffer) {
		if (compiled.usesCharColorFeedback) {
			textmodifier.setUniform(CHANNEL_SAMPLERS.charColor, feedbackBuffer.textures[1]);
		}
		if (compiled.usesCharFeedback) {
			textmodifier.setUniform(CHANNEL_SAMPLERS.char, feedbackBuffer.textures[0]);
		}
		if (compiled.usesCellColorFeedback) {
			textmodifier.setUniform(CHANNEL_SAMPLERS.cellColor, feedbackBuffer.textures[2]);
		}
	}

	// External layer texture uniforms
	const externalLayers = compiled.externalLayers;
	if (externalLayers && externalLayers.size > 0 && state.externalLayerMap) {
		for (const [layerId, info] of externalLayers) {
			const extLayer = state.externalLayerMap.get(layerId);
			if (!extLayer) {
				console.warn(`[textmode.synth.js] External layer not found: ${layerId}`);
				continue;
			}

			const extState = extLayer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			let extTextures: WebGLTexture[] | undefined;

			if (extState?.pingPongBuffers) {
				const extReadBuffer = extState.pingPongBuffers[extState.pingPongIndex];
				extTextures = extReadBuffer.textures;
			} else if (extLayer.drawFramebuffer) {
				extTextures = extLayer.drawFramebuffer.textures;
			}

			if (extTextures) {
				if (info.usesChar) {
					textmodifier.setUniform(
						`${info.uniformPrefix}${CHANNEL_SUFFIXES.char}`,
						extTextures[0]
					);
				}
				if (info.usesCharColor) {
					textmodifier.setUniform(
						`${info.uniformPrefix}${CHANNEL_SUFFIXES.charColor}`,
						extTextures[1]
					);
				}
				if (info.usesCellColor) {
					textmodifier.setUniform(
						`${info.uniformPrefix}${CHANNEL_SUFFIXES.cellColor}`,
						extTextures[2]
					);
				}
			}
		}
	}
}
