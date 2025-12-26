/**
 * SynthRenderer - Handles WebGL rendering of compiled synth shaders.
 *
 * This class manages the shader program, uniforms, and rendering to MRT framebuffers.
 */

// import type { GLRenderer, GLShader } from '../../../rendering';
import type { loadables, TextmodeFramebuffer } from 'textmode.js';
import type { SynthContext } from '../core/types';
import type { CompiledSynthShader } from '../compiler/types';
import { SYNTH_VERTEX_SHADER } from '../compiler/GLSLGenerator';
import { CharacterResolver } from './CharacterResolver';
// import { Textmodifier } from 'textmode.js';

/**
 * Renderer for compiled synth shaders.
 */
export class SynthRenderer {
    private readonly _textmodifier: any;
	private readonly _gl: WebGL2RenderingContext;
	private readonly _characterResolver: CharacterResolver;
	
	private _shader?: any;
	private _compiled?: CompiledSynthShader;
	private _uniformLocations = new Map<string, WebGLUniformLocation>();
	private _vao?: WebGLVertexArrayObject;
	private _positionBuffer?: WebGLBuffer;

	/**
	 * Create a SynthRenderer.
	 * @param renderer The GLRenderer instance
	 */
	constructor(textmodifier: any, renderer: any) {
        this._textmodifier = textmodifier;
		this._gl = renderer.context as WebGL2RenderingContext;
		this._characterResolver = new CharacterResolver();
		this._initGeometry();
	}

	/**
	 * Initialize the fullscreen quad geometry.
	 */
	private _initGeometry(): void {
		const gl = this._gl;

		// Create VAO
		this._vao = gl.createVertexArray()!;
		gl.bindVertexArray(this._vao);

		// Create position buffer (fullscreen quad as triangle strip)
		this._positionBuffer = gl.createBuffer()!;
		gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array([
				-1, -1, // bottom-left
				1, -1,  // bottom-right
				-1, 1,  // top-left
				1, 1,   // top-right
			]),
			gl.STATIC_DRAW
		);

		gl.bindVertexArray(null);
	}

	/**
	 * Set the compiled shader to use.
	 * @param compiled The compiled synth shader
	 */
	public async setShader(compiled: CompiledSynthShader): Promise<void> {
		this._compiled = compiled;

		// Invalidate cached character indices when shader changes
		this._characterResolver.invalidate();

		// Debug: log the generated shader source
		console.log('[SynthRenderer] Generated fragment shader:\n', compiled.fragmentSource);

		// Compile the shader using the renderer
		this._shader = await this._textmodifier.createShader(SYNTH_VERTEX_SHADER, compiled.fragmentSource);

		// Cache uniform locations
		this._uniformLocations.clear();

		// Standard uniforms
		this._cacheUniformLocation('time');
		this._cacheUniformLocation('resolution');

		// Dynamic uniforms from compilation
		for (const [name] of compiled.uniforms) {
			this._cacheUniformLocation(name);
		}

		// Character mapping uniforms
		if (compiled.charMapping) {
			this._cacheUniformLocation('u_charMap');
			this._cacheUniformLocation('u_charMapSize');
		}
	}

	/**
	 * Cache a uniform location.
	 */
	private _cacheUniformLocation(name: string): void {
		if (!this._shader) return;

        console.log(this._shader);
        console.log(this._shader.glProgram);

		const loc = this._gl.getUniformLocation(this._shader.glProgram, name);
		if (loc) {
			this._uniformLocations.set(name, loc);
		}
	}

	/**
	 * Render the synth to the target framebuffer.
	 * @param target The target MRT framebuffer
	 * @param width Width in pixels
	 * @param height Height in pixels
	 * @param context The synth context with time, resolution, etc.
	 * @param font The font to use for resolving character indices
	 */
	public render(
		target: TextmodeFramebuffer,
		width: number,
		height: number,
		context: SynthContext,
		font: loadables.TextmodeFont
	): void {
		if (!this._shader || !this._compiled || !this._vao) {
			console.warn('[SynthRenderer] Cannot render: missing shader, compiled data, or VAO');
			return;
		}

		const gl = this._gl;

		// Use the framebuffer's begin method to properly bind it
		target.begin();

		// Save GL state that we'll modify
		const depthTestEnabled = gl.isEnabled(gl.DEPTH_TEST);
		const blendEnabled = gl.isEnabled(gl.BLEND);

		// Disable depth testing for fullscreen quad rendering
		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.BLEND);

		// Clear all color attachments and depth buffer
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Use the shader program
		gl.useProgram(this._shader.glProgram);

		// Set standard uniforms
		this._setUniform('time', context.time);
		this._setUniform('resolution', [width, height]);

		// Set dynamic uniforms
		for (const [name, updater] of this._compiled.dynamicUpdaters) {
			const value = updater(context);
			this._setUniform(name, value);
		}

		// Set static uniforms
		for (const [name, uniform] of this._compiled.uniforms) {
			if (!uniform.isDynamic && typeof uniform.value !== 'function') {
				this._setUniform(name, uniform.value);
			}
		}

		// Set character mapping uniform (resolved using font's character indices)
		if (this._compiled.charMapping) {
			const loc = this._uniformLocations.get('u_charMap');
			const sizeLoc = this._uniformLocations.get('u_charMapSize');
			if (loc && sizeLoc) {
				const resolvedIndices = this._characterResolver.resolve(
					this._compiled.charMapping.chars,
					font
				);
				gl.uniform1iv(loc, resolvedIndices);
				gl.uniform1i(sizeLoc, resolvedIndices.length);
			}
		}

		// Bind VAO
		gl.bindVertexArray(this._vao);

		// Set up position attribute at layout location 0
		gl.bindBuffer(gl.ARRAY_BUFFER, this._positionBuffer!);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		// Draw fullscreen quad
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		// Check for GL errors (debugging)
		const err = gl.getError();
		if (err !== gl.NO_ERROR) {
			console.error('[SynthRenderer] GL error after draw:', err);
		}

		// Cleanup attribute
		gl.disableVertexAttribArray(0);

		// Cleanup
		gl.bindVertexArray(null);

		// Restore GL state
		if (depthTestEnabled) gl.enable(gl.DEPTH_TEST);
		if (blendEnabled) gl.enable(gl.BLEND);

		// End the framebuffer binding
		target.end();
	}

	/**
	 * Set a uniform value.
	 */
	private _setUniform(name: string, value: number | number[]): void {
		const loc = this._uniformLocations.get(name);
		if (!loc) return;

		const gl = this._gl;

		if (typeof value === 'number') {
			gl.uniform1f(loc, value);
		} else if (Array.isArray(value)) {
			switch (value.length) {
				case 2:
					gl.uniform2fv(loc, value);
					break;
				case 3:
					gl.uniform3fv(loc, value);
					break;
				case 4:
					gl.uniform4fv(loc, value);
					break;
			}
		}
	}

	/**
	 * Dispose of resources.
	 */
	public dispose(): void {
		const gl = this._gl;

		if (this._vao) {
			gl.deleteVertexArray(this._vao);
			this._vao = undefined;
		}

		if (this._positionBuffer) {
			gl.deleteBuffer(this._positionBuffer);
			this._positionBuffer = undefined;
		}

		this._uniformLocations.clear();
		this._shader = undefined;
		this._compiled = undefined;
	}
}
