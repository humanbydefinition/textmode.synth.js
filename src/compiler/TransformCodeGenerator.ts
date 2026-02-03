import type { ProcessedTransform } from '../transforms/TransformDefinition';
import type { CompilationTarget } from './types';
import type { ExternalLayerReference, TextmodeSourceReference } from '../core/types';
import { getTextureChannel } from './channels';
import { CHANNEL_SAMPLERS, CHANNEL_SUFFIXES } from '../core/constants';

/**
 * Result of generating code for a transform.
 */
export interface TransformCodeResult {
	/** The color variable name after this transform */
	colorVar: string;
	/** The character variable name (if modified) */
	charVar?: string;
	/** The flags variable name (if modified) */
	flagsVar?: string;
	/** The rotation variable name (if modified) */
	rotationVar?: string;
}

/**
 * Generates GLSL code for individual transforms.
 *
 * This module handles the code generation logic for each transform type,
 * including context-aware function naming for src() operations.
 */
export class TransformCodeGenerator {
	/**
	 * Generate a context-aware GLSL function for src() or srcTexture().
	 *
	 * When the transform is 'src', this generates a context-specific GLSL function
	 * that samples the appropriate texture based on the current compilation target:
	 * - char context → samples prevCharBuffer
	 * - charColor/main context → samples prevCharColorBuffer (primary color)
	 * - cellColor context → samples prevCellColorBuffer
	 *
	 * For external layer references, generates a function that samples from
	 * the external layer's texture uniforms.
	 *
	 * For TextmodeSource references (srcTexture), generates a function that samples
	 * from the TextmodeSource's texture uniform.
	 *
	 * @param def - The processed transform definition
	 * @param name - The transform name
	 * @param currentTarget - The current compilation target
	 * @param externalRef - Optional external layer reference
	 * @param textmodeSourceRef - Optional TextmodeSource reference
	 * @param getExternalPrefix - Function to get external layer uniform prefix
	 * @param getTextmodeSourceUniform - Function to get TextmodeSource uniform name
	 * @returns The GLSL function code
	 */
	public getContextAwareGlslFunction(
		def: ProcessedTransform,
		name: string,
		currentTarget: CompilationTarget,
		externalRef?: ExternalLayerReference,
		textmodeSourceRef?: TextmodeSourceReference,
		getExternalPrefix?: (layerId: string) => string,
		getTextmodeSourceUniform?: (sourceId: string) => string
	): string {
		// Handle srcTexture for TextmodeSource (images/videos)
		if (name === 'srcTexture' && textmodeSourceRef && getTextmodeSourceUniform) {
			return this._generateTextmodeSourceFunction(
				textmodeSourceRef,
				currentTarget,
				getTextmodeSourceUniform
			);
		}

		if (name !== 'src') {
			return def.glslFunction;
		}

		if (externalRef && getExternalPrefix) {
			// External layer reference - generate sampler for external layer
			return this._generateExternalSrcFunction(externalRef, currentTarget, getExternalPrefix);
		}

		// Self-feedback - generate context-specific src function
		return this._generateSelfFeedbackSrcFunction(currentTarget);
	}

	/**
	 * Get the function name to call for a transform.
	 * Handles context-aware naming for src() and srcTexture() operations.
	 */
	public getFunctionName(
		def: ProcessedTransform,
		currentTarget: CompilationTarget,
		externalRef?: ExternalLayerReference,
		textmodeSourceRef?: TextmodeSourceReference,
		getExternalPrefix?: (layerId: string) => string,
		getTextmodeSourceUniform?: (sourceId: string) => string
	): string {
		// Handle srcTexture for TextmodeSource
		if (def.name === 'srcTexture' && textmodeSourceRef && getTextmodeSourceUniform) {
			const uniformName = getTextmodeSourceUniform(textmodeSourceRef.sourceId);
			return `srcTexture_${uniformName}_${currentTarget}`;
		}

		if (def.name !== 'src') {
			return def.name;
		}

		if (externalRef && getExternalPrefix) {
			const prefix = getExternalPrefix(externalRef.layerId);
			return `src_ext_${prefix}_${currentTarget}`;
		}

		return `src_${currentTarget}`;
	}

	/**
	 * Generate GLSL code for a transform and append to mainCode.
	 *
	 * @param mainCode - Array to append generated code lines
	 * @param def - The processed transform definition
	 * @param varId - Unique variable ID for this transform
	 * @param coordVar - Current coordinate variable name
	 * @param colorVar - Current color variable name
	 * @param charVar - Current character variable name (if any)
	 * @param flagsVar - Current flags variable name (if any)
	 * @param rotationVar - Current rotation variable name (if any)
	 * @param args - Processed argument strings
	 * @param currentTarget - Current compilation target
	 * @param nestedColorVar - Nested source color variable (for combine ops)
	 * @param externalRef - External layer reference (if any)
	 * @param getExternalPrefix - Function to get external layer prefix
	 * @returns The transform code result with updated variable names
	 */
	public generateTransformCode(
		mainCode: string[],
		def: ProcessedTransform,
		varId: number,
		coordVar: string,
		colorVar: string,
		charVar: string | undefined,
		flagsVar: string | undefined,
		rotationVar: string | undefined,
		args: string[],
		currentTarget: CompilationTarget,
		nestedColorVar?: string,
		externalRef?: ExternalLayerReference,
		textmodeSourceRef?: TextmodeSourceReference,
		getExternalPrefix?: (layerId: string) => string,
		getTextmodeSourceUniform?: (sourceId: string) => string
	): TransformCodeResult {
		// Get the function name to call
		const funcName = this.getFunctionName(
			def,
			currentTarget,
			externalRef,
			textmodeSourceRef,
			getExternalPrefix,
			getTextmodeSourceUniform
		);

		// Build function call arguments
		const buildArgs = (...baseArgs: string[]) => [...baseArgs, ...args].join(', ');

		let newColorVar = colorVar;
		let newCharVar = charVar;
		let newFlagsVar = flagsVar;
		let newRotationVar = rotationVar;

		switch (def.type) {
			case 'src': {
				const newColor = `c${varId}`;
				mainCode.push(`\tvec4 ${newColor} = ${funcName}(${buildArgs(coordVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'coord': {
				const newCoord = `st${varId}`;
				mainCode.push(`\tvec2 ${newCoord} = ${funcName}(${buildArgs(coordVar)});`);
				mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}

			case 'color': {
				const newColor = `c${varId}`;
				mainCode.push(`\tvec4 ${newColor} = ${funcName}(${buildArgs(colorVar)});`);
				newColorVar = newColor;
				break;
			}

			case 'combine': {
				const newColor = `c${varId}`;
				mainCode.push(
					`\tvec4 ${newColor} = ${funcName}(${buildArgs(colorVar, nestedColorVar ?? 'vec4(0.0)')});`
				);
				newColorVar = newColor;
				break;
			}

			case 'combineCoord': {
				const newCoord = `st${varId}`;
				mainCode.push(
					`\tvec2 ${newCoord} = ${funcName}(${buildArgs(coordVar, nestedColorVar ?? 'vec4(0.0)')});`
				);
				mainCode.push(`\t${coordVar} = ${newCoord};`);
				break;
			}
		}

		return {
			colorVar: newColorVar,
			charVar: newCharVar,
			flagsVar: newFlagsVar,
			rotationVar: newRotationVar,
		};
	}

	/**
	 * Generate GLSL function for external layer src().
	 */
	private _generateExternalSrcFunction(
		ref: ExternalLayerReference,
		target: CompilationTarget,
		getExternalPrefix: (layerId: string) => string
	): string {
		const prefix = getExternalPrefix(ref.layerId);
		const channel = getTextureChannel(target);
		const suffix = CHANNEL_SUFFIXES[channel];
		const sampler = `${prefix}${suffix}`;

		const funcName = `src_ext_${prefix}_${target}`;

		return `
vec4 ${funcName}(vec2 _st) {
	return texture(${sampler}, fract(_st));
}
`;
	}

	/**
	 * Generate GLSL function for self-feedback src().
	 */
	private _generateSelfFeedbackSrcFunction(target: CompilationTarget): string {
		const channel = getTextureChannel(target);
		const sampler = CHANNEL_SAMPLERS[channel];
		const funcName = `src_${target}`;

		return `
vec4 ${funcName}(vec2 _st) {
	return texture(${sampler}, fract(_st));
}
`;
	}

	/**
	 * Generate GLSL function for TextmodeSource (image/video) sampling.
	 * Note: We flip the Y coordinate because WebGL textures have origin at bottom-left,
	 * but images/videos are loaded with origin at top-left.
	 */
	private _generateTextmodeSourceFunction(
		ref: TextmodeSourceReference,
		target: CompilationTarget,
		getUniformName: (sourceId: string) => string
	): string {
		const uniformName = getUniformName(ref.sourceId);
		const funcName = `srcTexture_${uniformName}_${target}`;

		return `
vec4 ${funcName}(vec2 _st) {
	// Flip Y axis to match image orientation (top-left origin)
	vec2 st = vec2(_st.x, 1.0 - _st.y);

	// Source dimensions
	vec2 dim = ${uniformName}_dim;

	// Scale coordinates based on source dimensions vs grid resolution
	// Higher scale value = smaller texture relative to screen
	vec2 scale = u_resolution / dim;
	
	// Calculate offset to center the texture
	// offset = (scale - 1.0) * 0.5
	vec2 offset = (scale - 1.0) * 0.5;
	
	// Apply scaling and offset
	vec2 uv = st * scale - offset;

	// Bounds check - return black/transparent if outside texture area
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
		return vec4(0.0);
	}

	return texture(${uniformName}, uv);
}
`;
	}
}
