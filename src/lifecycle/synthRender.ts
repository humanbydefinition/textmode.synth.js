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
import { collectExternalLayerRefs, collectTextmodeSourceRefs } from '../utils';
import { getGlobalBpm } from '../core/GlobalState';
import { shaderManager } from './ShaderManager';
import type { SynthContext, LayerSynthState } from '../core/types';

/**
 * Render synth source to layer framebuffers.
 *
 * Uses an atomic render pattern: all dynamic parameters are validated
 * BEFORE any WebGL operations. If any parameter fails, the entire frame
 * is skipped and the error propagates for the environment to handle.
 */
export async function synthRender(layer: TextmodeLayer, textmodifier: Textmodifier): Promise<void> {
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
		state.textmodeSourceMap = collectTextmodeSourceRefs(state.source);
		justCollected = true;
		state.needsCompile = true;
	}

	// Compile shader if needed
	if (state.needsCompile && state.compiled && !state.isCompiling) {
		state.isCompiling = true;
		const compilingTarget = state.compiled;

		// Collect external layer references from source
		if (!justCollected) {
			state.externalLayerMap = collectExternalLayerRefs(state.source);
			state.textmodeSourceMap = collectTextmodeSourceRefs(state.source);
		}

		try {
			// Use createFilterShader - leverages the instanced vertex shader
			const newShader = await textmodifier.createFilterShader(compilingTarget.fragmentSource);

			// Check if layer was disposed while compiling
			if (state.isDisposed) {
				if (newShader.dispose) newShader.dispose();
				return;
			}

			// Dispose old shader now that the new one is ready
			if (state.shader?.dispose) {
				state.shader.dispose();
			}

			state.shader = newShader;

			// Only mark as clean if the source hasn't changed since we started
			if (state.compiled === compilingTarget) {
				state.needsCompile = false;
			}
		} finally {
			state.isCompiling = false;
		}
	}

	if (!state.shader || !state.compiled || state.isDisposed) return;

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

		const copyShader = shaderManager.getShader();
		if (copyShader) {
			textmodifier.shader(copyShader);
			textmodifier.setUniform('u_charTex', writeBuffer.textures[0]);
			textmodifier.setUniform('u_charColorTex', writeBuffer.textures[1]);
			textmodifier.setUniform('u_cellColorTex', writeBuffer.textures[2]);
		} else {
			// Fallback if copy shader not yet ready (shouldn't happen after pre-setup hook)
			textmodifier.shader(state.shader);
			applySynthUniforms(layer, textmodifier, state, synthContext, readBuffer);
		}

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

	// Reset to default shader so other layers aren't affected by synth uniforms
	textmodifier.resetShader();
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
	textmodifier.setUniform('u_resolution', [ctx.cols, ctx.rows]);

	for (const [name, value] of state.dynamicValues) {
		textmodifier.setUniform(name, value);
	}

	const compiled = state.compiled!;
	// Only update static uniforms if the shader instance has changed
	const forceUpdate = state.staticUniformsAppliedTo !== state.shader;

	// Static uniforms
	if (forceUpdate) {
		for (const [name, uniform] of compiled.uniforms) {
			if (!uniform.isDynamic && typeof uniform.value !== 'function') {
				textmodifier.setUniform(name, uniform.value);
			}
		}
		state.staticUniformsAppliedTo = state.shader;
	}

	// Character mapping uniforms
	if (compiled.charMapping) {
		const indices = state.characterResolver.resolve(
			compiled.charMapping.chars,
			layer.font as TextmodeFont
		);
		// Only update if mapping changed or shader changed
		if (forceUpdate || indices !== state.lastCharMapIndices) {
			textmodifier.setUniform('u_charMap', indices);
			textmodifier.setUniform('u_charMapSize', indices.length);
			state.lastCharMapIndices = indices;
		}
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

	// TextmodeSource texture uniforms (images/videos)
	const textmodeSources = compiled.textmodeSources;
	if (textmodeSources && textmodeSources.size > 0 && state.textmodeSourceMap) {
		for (const [sourceId, info] of textmodeSources) {
			const tms = state.textmodeSourceMap.get(sourceId);
			if (!tms) {
				console.warn(`[textmode.synth.js] TextmodeSource not found: ${sourceId}`);
				continue;
			}

			// For video sources, update the texture to capture the current frame
			if (tms.update) {
				tms.update();
			}

			// Check that the texture exists
			if (!tms.texture) {
				console.warn(`[textmode.synth.js] TextmodeSource texture not loaded: ${sourceId}`);
				continue;
			}

			// Bind the source's texture using the generated uniform name
			textmodifier.setUniform(info.uniformName, tms.texture);
		}
	}
}
