/**
 * SynthRenderer - Handles WebGL rendering of compiled synth shaders.
 *
 * This class manages the shader program, uniforms, and rendering to MRT framebuffers.
 */
import type { loadables, TextmodeFramebuffer } from 'textmode.js';
import type { SynthContext } from '../core/types';
import type { CompiledSynthShader } from '../compiler/types';
/**
 * Renderer for compiled synth shaders.
 */
export declare class SynthRenderer {
    private readonly _textmodifier;
    private readonly _gl;
    private readonly _characterResolver;
    private _shader?;
    private _compiled?;
    private _uniformLocations;
    private _vao?;
    private _positionBuffer?;
    /**
     * Create a SynthRenderer.
     * @param renderer The GLRenderer instance
     */
    constructor(textmodifier: any, renderer: any);
    /**
     * Initialize the fullscreen quad geometry.
     */
    private _initGeometry;
    /**
     * Set the compiled shader to use.
     * @param compiled The compiled synth shader
     */
    setShader(compiled: CompiledSynthShader): Promise<void>;
    /**
     * Cache a uniform location.
     */
    private _cacheUniformLocation;
    /**
     * Render the synth to the target framebuffer.
     * @param target The target MRT framebuffer
     * @param width Width in pixels
     * @param height Height in pixels
     * @param context The synth context with time, resolution, etc.
     * @param font The font to use for resolving character indices
     * @param feedbackTextures Optional textures from the previous frame for self-feedback
     * @param externalTextures Optional textures from other layers for cross-layer feedback
     */
    render(target: TextmodeFramebuffer, width: number, height: number, context: SynthContext, font: loadables.TextmodeFont, feedbackTextures?: {
        prevBuffer?: WebGLTexture | null;
        prevCharBuffer?: WebGLTexture | null;
        prevCellColorBuffer?: WebGLTexture | null;
    }, externalTextures?: Map<string, WebGLTexture | null>): void;
    /**
     * Set a uniform value.
     */
    private _setUniform;
    /**
     * Dispose of resources.
     */
    dispose(): void;
}
//# sourceMappingURL=SynthRenderer.d.ts.map