/**
 * SynthPlugin - The textmode.js plugin that enables synth functionality on layers.
 * 
 * This plugin adds the `.synth()`, `.clearSynth()`, and `.hasSynth()` methods
 * to TextmodeLayer instances, enabling hydra-like procedural generation.
 */

import type {
    TextmodePlugin,
    TextmodePluginAPI,
    LayerRenderContext,
    loadables,
    layering 
} from 'textmode.js';

import type { TextmodeFramebuffer, /*GLRenderer*/ } from 'textmode.js';

import { SynthSource } from './core/SynthSource';
import { compileSynthSource } from './compiler/SynthCompiler';
import { SynthRenderer } from './renderer/SynthRenderer';
import type { CompiledSynthShader } from './compiler/types';
import type { SynthContext } from './core/types';

/**
 * Per-layer synth state stored via plugin state API.
 */
interface LayerSynthState {
    /** The original SynthSource - stored so synth can be set before layer is initialized */
    source: SynthSource;
    /** Compiled shader - created lazily when layer is ready */
    compiled?: CompiledSynthShader;
    /** Renderer instance - created lazily when layer is ready */
    renderer?: SynthRenderer;
    /** Time when synth was set */
    startTime: number;
    /** Whether the shader needs to be updated on next render */
    shaderNeedsUpdate: boolean;
    /** Whether this is the first render (needs initialization) */
    needsInitialization: boolean;
    /** 
     * Ping-pong framebuffers for feedback loops.
     * We use two buffers to avoid reading from and writing to the same texture.
     * pingPongBuffers[0] = buffer A, pingPongBuffers[1] = buffer B
     */
    pingPongBuffers?: [any, any];
    /** 
     * Current ping-pong index. 
     * We READ from pingPongBuffers[pingPongIndex] and WRITE to pingPongBuffers[1 - pingPongIndex].
     * After rendering, we swap the index.
     */
    pingPongIndex: number;
}

const PLUGIN_NAME = 'textmode.synth.js';

/**
 * The `textmode.synth.js` plugin to install.
 * 
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 * 
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, charNoise, osc } from 'textmode.synth.js';
 * 
 * const t = textmode.create({ plugins: [SynthPlugin] });
 * 
 * const layer = t.layers.add();
 * 
 * // Can be called globally, before setup()
 * layer.synth(
 *   charNoise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5).kaleid(4))
 * );
 * ```
 */
export const SynthPlugin: TextmodePlugin = {
    name: PLUGIN_NAME,
    version: '1.0.0',

    install(textmodifier, api: TextmodePluginAPI) {
        // Store renderer reference for creating SynthRenderers
        const glRenderer = api.renderer;

        // ============================================================
        // EXTEND LAYER WITH .synth() METHOD
        // ============================================================
        api.extendLayer('synth', function (this: layering.TextmodeLayer, source: SynthSource): void {
            const now = performance.now() / 1000;

            // Check if layer is already initialized (has grid and drawFramebuffer)
            const isInitialized = this.grid !== undefined && this.drawFramebuffer !== undefined;

            // Get existing state or create new
            let state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);

            if (state) {
                // Update existing state with new source
                state.source = source;
                state.startTime = now;
                state.shaderNeedsUpdate = true;

                // If already initialized, compile immediately
                if (isInitialized && state.renderer) {
                    state.compiled = compileSynthSource(source);
                    state.shaderNeedsUpdate = true;
                    // Note: pingPongBuffers will be created/updated in pre-render hook if needed
                } else {
                    // Mark for initialization on first render
                    state.needsInitialization = true;
                    state.compiled = undefined;
                }
            } else {
                // Create new state - defer compilation until render if not initialized
                state = {
                    source,
                    compiled: isInitialized ? compileSynthSource(source) : undefined,
                    renderer: undefined, // Always created lazily
                    startTime: now,
                    shaderNeedsUpdate: true,
                    needsInitialization: !isInitialized,
                    pingPongBuffers: undefined, // Created lazily only when feedback is used
                    pingPongIndex: 0,
                };
            }

            this.setPluginState(PLUGIN_NAME, state);
        });


        // ============================================================
        // LAYER PRE-RENDER HOOK - Render synth before user draw
        // ============================================================
        api.registerLayerPreRenderHook(async (layer: layering.TextmodeLayer, context: LayerRenderContext) => {
            const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (!state) {
                return;
            }

            const grid = layer.grid;
            const drawFramebuffer = layer.drawFramebuffer;

            if (!grid || !drawFramebuffer) {
                // Layer not yet initialized, skip this frame
                return;
            }

            // Lazy initialization - compile and create renderer on first render when ready
            if (state.needsInitialization || !state.compiled) {
                state.compiled = compileSynthSource(state.source);
                state.needsInitialization = false;
                state.shaderNeedsUpdate = true;
            }

            // Lazy initialization of SynthRenderer
            if (!state.renderer) {
                state.renderer = new SynthRenderer(textmodifier, glRenderer as unknown as any);
                state.shaderNeedsUpdate = true;
            }

            // Apply pending shader update
            if (state.shaderNeedsUpdate && state.compiled) {
                await state.renderer.setShader(state.compiled);
                state.shaderNeedsUpdate = false;
            }

            // Check if any type of feedback is used
            const usesFeedback = state.compiled?.usesFeedback ?? false;
            const usesCharFeedback = state.compiled?.usesCharFeedback ?? false;
            const usesCellColorFeedback = state.compiled?.usesCellColorFeedback ?? false;
            const usesAnyFeedback = usesFeedback || usesCharFeedback || usesCellColorFeedback;

            // Create ping-pong buffers if any feedback is used and buffers don't exist yet
            // We need TWO buffers to avoid GPU feedback loops (reading and writing same texture)
            if (usesAnyFeedback && !state.pingPongBuffers) {
                const tm = textmodifier as any;
                if (tm.createFramebuffer) {
                    state.pingPongBuffers = [
                        tm.createFramebuffer({ 
                            width: grid.cols, 
                            height: grid.rows, 
                            attachments: 3 
                        }),
                        tm.createFramebuffer({ 
                            width: grid.cols, 
                            height: grid.rows, 
                            attachments: 3 
                        })
                    ];
                    state.pingPongIndex = 0;
                }
            }

            // Build synth context
            const mouse = (context.textmodifier as any).mouse;

            const synthContext: SynthContext = {
                time: context.textmodifier.millis() / 1000,
                frameCount: context.frameCount,
                width: grid.width,
                height: grid.height,
                cols: grid.cols,
                rows: grid.rows,
                mouseX: mouse?.x ?? 0,
                mouseY: mouse?.y ?? 0,
            };

            // Handle feedback rendering with ping-pong buffers
            if (usesAnyFeedback && state.pingPongBuffers) {
                // Ping-pong approach to avoid GPU feedback loops:
                // - READ from pingPongBuffers[pingPongIndex] (contains previous frame)
                // - WRITE to pingPongBuffers[1 - pingPongIndex] (stores current frame for next iteration)
                // - Also WRITE to drawFramebuffer (for the layer system to process)
                // Both writes use the SAME prev textures, so the results are identical
                
                const readIndex = state.pingPongIndex;
                const writeIndex = 1 - state.pingPongIndex;
                
                const readBuffer = state.pingPongBuffers[readIndex];
                const writeBuffer = state.pingPongBuffers[writeIndex];
                
                // Build feedback textures object from the read buffer
                // Attachment 0 = character data, 1 = primary color, 2 = cell/secondary color
                const feedbackTextures = {
                    prevBuffer: usesFeedback ? (readBuffer?.textures?.[1] ?? null) : null,
                    prevCharBuffer: usesCharFeedback ? (readBuffer?.textures?.[0] ?? null) : null,
                    prevCellColorBuffer: usesCellColorFeedback ? (readBuffer?.textures?.[2] ?? null) : null,
                };
                
                // First render: to the ping-pong WRITE buffer (for next frame's feedback)
                state.renderer.render(
                    writeBuffer as unknown as TextmodeFramebuffer,
                    grid.cols,
                    grid.rows,
                    synthContext,
                    layer.font as unknown as loadables.TextmodeFont,
                    feedbackTextures
                );
                
                // Second render: to the actual drawFramebuffer (for layer processing)
                // Uses the SAME prev textures, so the result is identical
                state.renderer.render(
                    drawFramebuffer as unknown as TextmodeFramebuffer,
                    grid.cols,
                    grid.rows,
                    synthContext,
                    layer.font as unknown as loadables.TextmodeFont,
                    feedbackTextures
                );
                
                // Swap ping-pong index for next frame
                state.pingPongIndex = writeIndex;
            } else {
                // No feedback - render directly to drawFramebuffer
                state.renderer.render(
                    drawFramebuffer as unknown as TextmodeFramebuffer,
                    grid.cols,
                    grid.rows,
                    synthContext,
                    layer.font as unknown as loadables.TextmodeFont,
                    undefined
                );
            }
        });

        // ============================================================
        // LAYER DISPOSED HOOK - Clean up synth resources
        // ============================================================
        api.registerLayerDisposedHook((layer: layering.TextmodeLayer) => {
            const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (state?.renderer) {
                state.renderer.dispose();
            }
            // Note: Ping-pong buffers will be garbage collected
            // GLFramebuffer doesn't expose a public dispose method
        });
    },

    uninstall(_textmodifier, api: TextmodePluginAPI) {
        // Clean up all synth renderers
        const allLayers = [api.layerManager.base, ...api.layerManager.all];
        for (const layer of allLayers) {
            const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (state?.renderer) {
                state.renderer.dispose();
            }
            // Note: Ping-pong buffers will be garbage collected
            // GLFramebuffer doesn't expose a public dispose method
        }

        // Remove layer extensions
        api.removeLayerExtension('synth');
        api.removeLayerExtension('clearSynth');
        api.removeLayerExtension('hasSynth');
    },
};