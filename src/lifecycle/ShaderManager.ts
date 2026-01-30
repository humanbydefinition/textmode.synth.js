/**
 * Global Copy Shader Manager.
 *
 * Manages a single, shared copy shader instance for all layers using feedback loops.
 * The shader is compiled once during plugin initialization (pre-setup hook) and
 * reused across all layers, eliminating per-layer compilation overhead.
 */

import type { TextmodeShader, Textmodifier } from 'textmode.js';

/**
 * GLSL source for the optimized copy pass in feedback loops.
 * Blits the write buffer to the draw buffer efficiently using
 * textmode's three-texture MRT (Multiple Render Targets) system.
 */
const COPY_SHADER_SOURCE = `#version 300 es
precision highp float;

in vec2 v_uv;

layout(location = 0) out vec4 o_character;
layout(location = 1) out vec4 o_primaryColor;
layout(location = 2) out vec4 o_secondaryColor;

uniform sampler2D u_charTex;
uniform sampler2D u_charColorTex;
uniform sampler2D u_cellColorTex;

void main() {
	o_character = texture(u_charTex, v_uv);
	o_primaryColor = texture(u_charColorTex, v_uv);
	o_secondaryColor = texture(u_cellColorTex, v_uv);
}
`;

/**
 * Singleton manager for the global copy shader.
 *
 * The copy shader is used to efficiently blit the ping-pong write buffer
 * to the draw framebuffer during feedback rendering, avoiding the overhead
 * of re-running the full synth shader pipeline.
 */
class ShaderManager {
	private _shader: TextmodeShader | null = null;
	private _isCompiling = false;
	private _isDisposed = false;

	/**
	 * Initialize the copy shader.
	 * Should be called once during plugin pre-setup.
	 *
	 * @param textmodifier - The Textmodifier instance to compile the shader with
	 * @returns Promise that resolves when the shader is ready
	 */
	public async initialize(textmodifier: Textmodifier): Promise<void> {
		if (this._shader || this._isCompiling || this._isDisposed) {
			return;
		}

		this._isCompiling = true;

		try {
			this._shader = await textmodifier.createFilterShader(COPY_SHADER_SOURCE);
		} catch (err) {
			console.warn('[textmode.synth.js] Failed to compile copy shader:', err);
		} finally {
			this._isCompiling = false;
		}
	}

	/**
	 * Get the compiled copy shader, or null if not yet compiled.
	 */
	public getShader(): TextmodeShader | null {
		return this._shader;
	}

	/**
	 * Check if the shader is ready for use.
	 */
	public isReady(): boolean {
		return this._shader !== null;
	}

	/**
	 * Dispose the copy shader and clean up resources.
	 * Called during plugin uninstall.
	 */
	public dispose(): void {
		this._isDisposed = true;

		if (this._shader?.dispose) {
			this._shader.dispose();
		}

		this._shader = null;
		this._isCompiling = false;
	}

	/**
	 * Reset the manager state for reinitialization.
	 * Called when the plugin is reinstalled.
	 */
	public reset(): void {
		this._isDisposed = false;
	}
}

/**
 * Singleton instance of the copy shader manager.
 * @internal
 */
export const shaderManager = new ShaderManager();
