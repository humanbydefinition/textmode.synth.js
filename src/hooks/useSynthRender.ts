import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodeFont } from 'textmode.js/loadables';
import type { TextmodeFramebuffer } from 'textmode.js';
import { PLUGIN_NAME } from '../constants';
import { compileSynthSource } from '../compiler/SynthCompiler';
import { collectExternalLayerRefs } from '../utils/collectExternalLayerRefs';
import { getGlobalBpm } from '../core/GlobalState';
import type { SynthContext } from '../core/types';
import type { LayerSynthState } from '../types/LayerSynthState';

/**
 * Hook to render synth before user draw.
 */
export async function useSynthRender(layer: TextmodeLayer, textmodifier: any) {
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
    const effectiveBpm = state.bpm ?? getGlobalBpm();
    const synthContext: SynthContext = {
        time: textmodifier.millis() / 1000,
        frameCount: textmodifier.frameCount,
        width: grid.width,
        height: grid.height,
        cols: grid.cols,
        rows: grid.rows,
        bpm: effectiveBpm
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
}
