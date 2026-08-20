/**
 * Synth render lifecycle callback.
 *
 * Handles rendering of synth sources with atomic parameter validation
 * to prevent WebGL errors from incomplete uniform state.
 */

import type { TextmodeLayer } from 'textmode.js';
import type { TextmodeFont, TextmodeShader } from 'textmode.js';
import type { TextmodeFramebuffer, Textmodifier } from 'textmode.js';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { CHANNEL_SUFFIXES, CHANNEL_SAMPLERS } from '../core/constants';
import { collectExternalLayerRefs, collectTextmodeSourceRefs } from '../utils';
import { getInstanceBpm, getInstanceSeed } from '../extensions/textmodifier';
import type { SynthContext, LayerSynthState } from '../core/types';
import { getLayerSynthState } from './layerState';

/**
 * Render synth source to layer framebuffers.
 *
 * Uses an atomic render pattern: all dynamic parameters are validated
 * BEFORE any WebGL operations. If any parameter fails, the entire frame
 * is skipped and the error propagates for the environment to handle.
 */
export function synthRender(
	layer: TextmodeLayer,
	textmodifier: Textmodifier,
	copyShader: TextmodeShader | null = null
): void {
	const state = getLayerSynthState(layer);
	if (!state) return;

	const grid = layer.grid;
	const drawFramebuffer = layer.drawFramebuffer;

	if (!grid || !drawFramebuffer) {
		// Layer not yet initialized
		return;
	}

	let justCollected = false;

	// Lazy compile on first render or dynamic re-eval
	if ((state.sourceFactory && state.needsCompile) || !state.compiled) {
		let sourceToCompile = state.source;
		let shouldCompile = false;

		// Evaluate factory if present to check for updates
		if (state.sourceFactory) {
			try {
				const newSource = state.sourceFactory();
				const newTarget = compileSynthSource(newSource);

				// Compare with existing compiled source
				if (!state.compiled || newTarget.fragmentSource !== state.compiled.fragmentSource) {
					// Source changed! Usage of new dependencies (like video) detected.
					state.source = newSource;
					sourceToCompile = newSource;
					state.compiled = newTarget;
					justCollected = false; // Need to recollect based on new source
					shouldCompile = true;
				}
			} catch (e) {
				console.warn('[textmode.synth.js] Failed to evaluate synth factory:', e);
			}
		}

		if (shouldCompile || !state.compiled || state.needsCompile) {
			if (!state.compiled) {
				state.compiled = compileSynthSource(sourceToCompile);
			}
			state.externalLayerMap = collectExternalLayerRefs(sourceToCompile);
			state.textmodeSourceMap = collectTextmodeSourceRefs(sourceToCompile);
			justCollected = true;
			state.needsCompile = true;
		}
	}

	// Compile shader if needed
	if (state.needsCompile && state.compiled && !state.isCompiling) {
		state.isCompiling = true;
		const compilingTarget = state.compiled;
		const compilingGeneration = state.generation;

		// Collect external layer references from source
		if (!justCollected) {
			state.externalLayerMap = collectExternalLayerRefs(state.source);
			state.textmodeSourceMap = collectTextmodeSourceRefs(state.source);
		}

		void textmodifier
			.createMaterialShader(compilingTarget.fragmentSource)
			.then((newShader) => {
				if (
					state.isDisposed ||
					state.generation !== compilingGeneration ||
					state.compiled !== compilingTarget
				) {
					newShader.dispose();
					return;
				}
				state.pendingShader?.dispose();
				state.pendingShader = newShader;
				state.needsCompile = false;
			})
			.catch((error) => {
				if (!state.isDisposed) console.warn('[textmode.synth.js] Failed to compile synth shader:', error);
			})
			.finally(() => {
				state.isCompiling = false;
			});
	}

	if (state.pendingShader) {
		state.shader?.dispose();
		state.shader = state.pendingShader;
		state.pendingShader = undefined;
	}

	if (!state.shader || !state.compiled || state.isDisposed) return;
	const activeShader = state.shader;

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
	synthContext.bpm = state.bpm ?? getInstanceBpm(textmodifier);
	synthContext.onError = state.onDynamicError;

	// Evaluate dynamic parameters with graceful error handling.
	// On error: report via callback, use fallback value, continue rendering.
	state.dynamicValues.clear();
	for (const [name, updater] of state.compiled.dynamicUpdaters) {
		const value = updater(synthContext);
		state.dynamicValues.set(name, value);
	}

	try {
		// Execute render. Each pass owns its framebuffer lifetime so failures in
		// uniforms, drawing, or shader selection cannot leave a target bound.
		if (usesAnyFeedback && state.pingPongBuffers) {
			const readBuffer = state.pingPongBuffers[state.pingPongIndex];
			const writeBuffer = state.pingPongBuffers[1 - state.pingPongIndex];

			renderPass(writeBuffer, () => {
				textmodifier.clear();
				textmodifier.shader(activeShader);
				applySynthUniforms(layer, textmodifier, state, synthContext, readBuffer);
				textmodifier.rect(grid.cols, grid.rows);
			});

			renderPass(drawFramebuffer, () => {
				textmodifier.clear();

				if (copyShader) {
					textmodifier.shader(copyShader);
					textmodifier.setUniform('u_charTex', writeBuffer.textures[0]);
					textmodifier.setUniform('u_charColorTex', writeBuffer.textures[1]);
					textmodifier.setUniform('u_cellColorTex', writeBuffer.textures[2]);
				} else {
					// Fallback if copy shader is not ready yet.
					textmodifier.shader(activeShader);
					applySynthUniforms(layer, textmodifier, state, synthContext, readBuffer);
				}

				textmodifier.rect(grid.cols, grid.rows);
			});

			state.pingPongIndex = 1 - state.pingPongIndex;
		} else {
			renderPass(drawFramebuffer, () => {
				textmodifier.clear();
				textmodifier.shader(activeShader);
				applySynthUniforms(layer, textmodifier, state, synthContext, null);
				textmodifier.rect(grid.cols, grid.rows);
			});
		}
	} finally {
		// Always restore the host shader, including when a pass throws.
		textmodifier.resetShader();
	}
}

function renderPass(framebuffer: TextmodeFramebuffer, draw: () => void): void {
	let begun = false;
	try {
		framebuffer.begin();
		begun = true;
		draw();
	} finally {
		if (begun) framebuffer.end();
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
	textmodifier.setUniform('u_resolution', [ctx.cols, ctx.rows]);

	// Apply seed uniform for deterministic randomness
	const seed = getInstanceSeed(textmodifier);
	textmodifier.setUniform('u_seed', seed ?? 0);

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
	}

	// Character mapping uniforms
	if (compiled.charMapping) {
		const indices = state.characterResolver.resolve(compiled.charMapping.chars, layer.font as TextmodeFont);
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

			const extState = getLayerSynthState(extLayer);
			let extTextures: WebGLTexture[] | undefined;

			if (extState?.pingPongBuffers) {
				const extReadBuffer = extState.pingPongBuffers[extState.pingPongIndex];
				extTextures = extReadBuffer.textures;
			} else if (extLayer.drawFramebuffer) {
				extTextures = extLayer.drawFramebuffer.textures;
			}

			if (extTextures) {
				if (info.usesChar) {
					textmodifier.setUniform(`${info.uniformPrefix}${CHANNEL_SUFFIXES.char}`, extTextures[0]);
				}
				if (info.usesCharColor) {
					textmodifier.setUniform(`${info.uniformPrefix}${CHANNEL_SUFFIXES.charColor}`, extTextures[1]);
				}
				if (info.usesCellColor) {
					textmodifier.setUniform(`${info.uniformPrefix}${CHANNEL_SUFFIXES.cellColor}`, extTextures[2]);
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

			const sourceWidth = tms.width ?? 1;
			const sourceHeight = tms.height ?? 1;
			const safeWidth = sourceWidth > 0 ? sourceWidth : 1;
			const safeHeight = sourceHeight > 0 ? sourceHeight : 1;
			textmodifier.setUniform(`${info.uniformName}_dim`, [safeWidth, safeHeight]);

			// Check that the texture exists
			if (!tms.texture) {
				console.warn(`[textmode.synth.js] TextmodeSource texture not loaded: ${sourceId}`);
				continue;
			}

			// Bind the source's texture using the generated uniform name
			textmodifier.setUniform(info.uniformName, tms.texture);
		}
	}

	if (forceUpdate) state.staticUniformsAppliedTo = state.shader;
}
