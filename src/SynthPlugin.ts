import type {
	TextmodeFramebuffer,
} from 'textmode.js';

import type {
	TextmodePlugin,
	TextmodePluginAPI,
} from 'textmode.js/plugins';

import type { TextmodeFont } from 'textmode.js/loadables';
import type { TextmodeLayer } from 'textmode.js/layering';

import { SynthSource } from './core/SynthSource';
import { compileSynthSource } from './compiler/SynthCompiler';
import type { CompiledSynthShader } from './compiler/types';
import type { SynthContext } from './core/types';
import { CharacterResolver } from './utils/CharacterResolver';

/**
 * Per-layer synth state stored via plugin state API.
 */
interface LayerSynthState {
	/** The original SynthSource */
	source: SynthSource;
	/** Compiled shader data */
	compiled?: CompiledSynthShader;
	/** The compiled GLShader instance */
	shader?: any; // GLShader type from textmode.js
	/** Character resolver for this layer's synth */
	characterResolver: CharacterResolver;
	/** Time when synth was set */
	startTime: number;
	/** Whether the shader needs to be recompiled */
	needsCompile: boolean;
	/**
	 * Ping-pong framebuffers for feedback loops.
	 * pingPongBuffers[0] = buffer A, pingPongBuffers[1] = buffer B
	 */
	pingPongBuffers?: [TextmodeFramebuffer, TextmodeFramebuffer];
	/**
	 * Current ping-pong index.
	 * READ from pingPongBuffers[pingPongIndex], WRITE to pingPongBuffers[1 - pingPongIndex].
	 */
	pingPongIndex: number;
	/**
	 * External layer references mapped to their layer objects.
	 * Populated during compilation from the source's external layer refs.
	 */
	externalLayerMap?: Map<string, TextmodeLayer>;
}

const PLUGIN_NAME = 'textmode.synth.js';

/**
 * Collect all external layer references from a SynthSource and its nested chains.
 */
function collectExternalLayerRefs(source: SynthSource): Map<string, TextmodeLayer> {
	const layers = new Map<string, TextmodeLayer>();
	
	// Collect from main source
	for (const [, ref] of source.externalLayerRefs) {
		layers.set(ref.layerId, ref.layer as TextmodeLayer);
	}
	
	// Collect from nested sources
	for (const [, nested] of source.nestedSources) {
		const nestedRefs = collectExternalLayerRefs(nested);
		for (const [id, layer] of nestedRefs) {
			layers.set(id, layer);
		}
	}
	
	// Collect from charSource
	if (source.charSource) {
		const charRefs = collectExternalLayerRefs(source.charSource);
		for (const [id, layer] of charRefs) {
			layers.set(id, layer);
		}
	}
	
	// Collect from colorSource
	if (source.colorSource) {
		const colorRefs = collectExternalLayerRefs(source.colorSource);
		for (const [id, layer] of colorRefs) {
			layers.set(id, layer);
		}
	}
	
	// Collect from cellColorSource
	if (source.cellColorSource) {
		const cellRefs = collectExternalLayerRefs(source.cellColorSource);
		for (const [id, layer] of cellRefs) {
			layers.set(id, layer);
		}
	}
	
	return layers;
}

/**
 * The `textmode.synth.js` plugin to install.
 *
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, noise, osc } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * t.layers.base.synth(
 *   noise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5).kaleid(4))
 * );
 * ```
 */
export const SynthPlugin: TextmodePlugin = {
	name: PLUGIN_NAME,
	version: '1.0.0',

	install(textmodifier, api: TextmodePluginAPI) {
		// ============================================================
		// EXTEND LAYER WITH .synth() METHOD
		// ============================================================
		api.extendLayer('synth', function (this: TextmodeLayer, source: SynthSource): void {
			const now = performance.now() / 1000;
			const isInitialized = this.grid !== undefined && this.drawFramebuffer !== undefined;

			let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

			if (state) {
				// Update existing state
				state.source = source;
				state.startTime = now;
				state.needsCompile = true;
				state.characterResolver.invalidate();

				if (isInitialized) {
					state.compiled = compileSynthSource(source);
				}
			} else {
				// Create new state
				state = {
					source,
					compiled: isInitialized ? compileSynthSource(source) : undefined,
					shader: undefined,
					characterResolver: new CharacterResolver(),
					startTime: now,
					needsCompile: true,
					pingPongBuffers: undefined,
					pingPongIndex: 0,
				};
			}

			this.setPluginState(PLUGIN_NAME, state);
		});


		// ============================================================
		// LAYER PRE-RENDER HOOK - Render synth before user draw
		// ============================================================
		api.registerLayerPreRenderHook(async (layer: TextmodeLayer) => {
			const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			if (!state) return;

			const grid = layer.grid;
			const drawFramebuffer = layer.drawFramebuffer;

			if (!grid || !drawFramebuffer) {
				// Layer not yet initialized
				return;
			}

			// Lazy compile on first render
			if (!state.compiled) {
				state.compiled = compileSynthSource(state.source);
				state.externalLayerMap = collectExternalLayerRefs(state.source);
				state.needsCompile = true;
			}

			// Compile shader if needed
			if (state.needsCompile && state.compiled) {
				// Dispose old shader
				if (state.shader?.dispose) {
					state.shader.dispose();
				}

				// Collect external layer references from source
				state.externalLayerMap = collectExternalLayerRefs(state.source);

				// Use createFilterShader - leverages the instanced vertex shader
				state.shader = await textmodifier.createFilterShader(state.compiled.fragmentSource);
				state.needsCompile = false;
			}

			if (!state.shader || !state.compiled) return;

			// Check if feedback is used
			const usesFeedback = state.compiled.usesFeedback;
			const usesCharFeedback = state.compiled.usesCharFeedback;
			const usesCellColorFeedback = state.compiled.usesCellColorFeedback;
			const usesAnyFeedback = usesFeedback || usesCharFeedback || usesCellColorFeedback;

			// Create ping-pong buffers if feedback is used
			if (usesAnyFeedback && !state.pingPongBuffers) {
				state.pingPongBuffers = [
					textmodifier.createFramebuffer({
						width: grid.cols,
						height: grid.rows,
						attachments: 3,
					}),
					textmodifier.createFramebuffer({
						width: grid.cols,
						height: grid.rows,
						attachments: 3,
					}),
				] as [TextmodeFramebuffer, TextmodeFramebuffer];
				state.pingPongIndex = 0;
			}

			// Build synth context
			const synthContext: SynthContext = {
				time: textmodifier.millis() / 1000,
				frameCount: textmodifier.frameCount,
				width: grid.width,
				height: grid.height,
				cols: grid.cols,
				rows: grid.rows
			};

			// Helper to set all uniforms
			const setUniforms = (feedbackBuffer: TextmodeFramebuffer | null) => {
				// Standard uniforms
				textmodifier.setUniform('time', synthContext.time);
				textmodifier.setUniform('resolution', [synthContext.cols, synthContext.rows]);

				// Dynamic uniforms (evaluated each frame)
				for (const [name, updater] of state.compiled!.dynamicUpdaters) {
					textmodifier.setUniform(name, updater(synthContext));
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

				// Feedback texture uniforms
				if (feedbackBuffer) {
					if (usesFeedback) {
						textmodifier.setUniform('prevBuffer', feedbackBuffer.textures[1]);
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
							console.warn(`[SynthPlugin] External layer not found: ${layerId}`);
							continue;
						}

						// Get the external layer's synth state to access its ping-pong buffers
						const extState = extLayer.getPluginState<LayerSynthState>(PLUGIN_NAME);
						
						// Determine which buffer to sample from the external layer
						// If the external layer has ping-pong buffers (uses feedback), sample from the read buffer
						// Otherwise, sample from the draw framebuffer
						let extTextures: any[] | undefined;
						
						if (extState?.pingPongBuffers) {
							// External layer uses feedback - sample from its current read buffer
							const extReadBuffer = extState.pingPongBuffers[extState.pingPongIndex];
							extTextures = extReadBuffer.textures;
						} else if (extLayer.drawFramebuffer) {
							// External layer doesn't use feedback - sample from its draw framebuffer
							extTextures = extLayer.drawFramebuffer.textures;
						}

						if (extTextures) {
							if (info.usesChar) {
								textmodifier.setUniform(`${info.uniformPrefix}_char`, extTextures[0]);
							}
							if (info.usesPrimary) {
								textmodifier.setUniform(`${info.uniformPrefix}_primary`, extTextures[1]);
							}
							if (info.usesCellColor) {
								textmodifier.setUniform(`${info.uniformPrefix}_cell`, extTextures[2]);
							}
						}
					}
				}
			};

			// Render using textmode.js APIs
			if (usesAnyFeedback && state.pingPongBuffers) {
				const readBuffer = state.pingPongBuffers[state.pingPongIndex];
				const writeBuffer = state.pingPongBuffers[1 - state.pingPongIndex];

				// Render to ping-pong write buffer (for next frame's feedback)
				writeBuffer.begin();
				textmodifier.clear();
				textmodifier.shader(state.shader);
				setUniforms(readBuffer);
				textmodifier.rect(grid.cols, grid.rows);
				writeBuffer.end();

				// Render to draw framebuffer (for layer processing)
				drawFramebuffer.begin();
				textmodifier.clear();
				textmodifier.shader(state.shader);
				setUniforms(readBuffer);
				textmodifier.rect(grid.cols, grid.rows);
				drawFramebuffer.end();

				// Swap ping-pong index
				state.pingPongIndex = 1 - state.pingPongIndex;
			} else {
				// No feedback - render directly
				drawFramebuffer.begin();
				textmodifier.clear();
				textmodifier.shader(state.shader);
				setUniforms(null);
				textmodifier.rect(grid.cols, grid.rows);
				drawFramebuffer.end();
			}
		});

		// ============================================================
		// LAYER DISPOSED HOOK - Clean up synth resources
		// ============================================================
		api.registerLayerDisposedHook((layer: TextmodeLayer) => {
			const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			if (state) {
				if (state.shader?.dispose) {
					state.shader.dispose();
				}
				if (state.pingPongBuffers) {
					state.pingPongBuffers[0].dispose?.();
					state.pingPongBuffers[1].dispose?.();
				}
			}
		});
	},

	uninstall(_textmodifier, api: TextmodePluginAPI) {
		// Clean up all synth states
		const allLayers = [api.layerManager.base, ...api.layerManager.all];
		for (const layer of allLayers) {
			const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
			if (state) {
				if (state.shader?.dispose) {
					state.shader.dispose();
				}
				if (state.pingPongBuffers) {
					state.pingPongBuffers[0].dispose?.();
					state.pingPongBuffers[1].dispose?.();
				}
			}
		}

		// Remove layer extensions
		api.removeLayerExtension('synth');
	},
};