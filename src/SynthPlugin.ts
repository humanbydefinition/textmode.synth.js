/**
 * SynthPlugin - The textmode.js plugin that enables synth functionality on layers.
 * 
 * This plugin adds the `.synth()`, `.clearSynth()`, and `.hasSynth()` methods
 * to TextmodeLayer instances, enabling hydra-like procedural generation.
 */

import type { 
    TextmodePlugin, 
    TextmodePluginAPI, 
    LayerRenderContext 
} from 'textmode.js';
import type { TextmodeLayer } from 'textmode.js/layering';
import type { TextmodeFont } from 'textmode.js/loadables';
import type { GLRenderer, GLFramebuffer } from 'textmode.js';

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
}

const PLUGIN_NAME = 'textmode-synth';

/**
 * The textmode-synth plugin.
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
        api.extendLayer('synth', function(this: TextmodeLayer, source: SynthSource): void {
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
                };
            }

            this.setPluginState(PLUGIN_NAME, state);
            
            // Mark that this layer has renderable plugin content
            this.setPluginState('__hasRenderableContent__', true);
        });

        // ============================================================
        // EXTEND LAYER WITH .clearSynth() METHOD
        // ============================================================
        api.extendLayer('clearSynth', function(this: TextmodeLayer): void {
            const state = this.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (state?.renderer) {
                state.renderer.dispose();
            }
            this.deletePluginState(PLUGIN_NAME);
        });

        // ============================================================
        // EXTEND LAYER WITH .hasSynth() METHOD
        // ============================================================
        api.extendLayer('hasSynth', function(this: TextmodeLayer): boolean {
            return this.hasPluginState(PLUGIN_NAME);
        });

        // ============================================================
        // LAYER PRE-RENDER HOOK - Render synth before user draw
        // ============================================================
        api.registerLayerPreRenderHook(async (layer: TextmodeLayer, context: LayerRenderContext) => {
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
                state.renderer = new SynthRenderer(textmodifier, glRenderer as unknown as GLRenderer);
                state.shaderNeedsUpdate = true;
            }

            // Apply pending shader update
            if (state.shaderNeedsUpdate && state.compiled) {
                await state.renderer.setShader(state.compiled);
                state.shaderNeedsUpdate = false;
            }

            // Build synth context
            const now = performance.now() / 1000;
            const mouse = (context.textmodifier as any).mouse;
            
            const synthContext: SynthContext = {
                time: now - state.startTime,
                frameCount: context.frameCount,
                width: grid.width,
                height: grid.height,
                cols: grid.cols,
                rows: grid.rows,
                mouseX: mouse?.x ?? 0,
                mouseY: mouse?.y ?? 0,
            };

            // Render synth to the layer's MRT framebuffer
            state.renderer.render(
                drawFramebuffer as unknown as GLFramebuffer,
                grid.cols,
                grid.rows,
                synthContext,
                layer.font as unknown as TextmodeFont
            );

            // Mark that this layer has renderable content for this frame
            layer.setPluginState('__hasRenderableContent__', true);
        });

        // ============================================================
        // LAYER DISPOSED HOOK - Clean up synth resources
        // ============================================================
        api.registerLayerDisposedHook((layer: TextmodeLayer) => {
            const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (state?.renderer) {
                state.renderer.dispose();
            }
        });
    },

    uninstall(textmodifier, api: TextmodePluginAPI) {
        // Clean up all synth renderers
        const allLayers = [api.layerManager.base, ...api.layerManager.all];
        for (const layer of allLayers) {
            const state = layer.getPluginState<LayerSynthState>(PLUGIN_NAME);
            if (state?.renderer) {
                state.renderer.dispose();
            }
        }

        // Remove layer extensions
        api.removeLayerExtension('synth');
        api.removeLayerExtension('clearSynth');
        api.removeLayerExtension('hasSynth');
    },
};