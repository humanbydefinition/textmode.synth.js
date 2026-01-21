import type { ProcessedTransform } from '../transforms/TransformDefinition';
import type { CompilationTarget } from './types';
import type { ExternalLayerReference } from '../core/types';
import {
	getTextureChannel,
	CHANNEL_SAMPLERS,
	CHANNEL_SUFFIXES,
} from './channels';

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
	 * Generate a context-aware GLSL function for src().
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
	 * @param def - The processed transform definition
	 * @param name - The transform name
	 * @param currentTarget - The current compilation target
	 * @param externalRef - Optional external layer reference
	 * @param getExternalPrefix - Function to get external layer uniform prefix
	 * @returns The GLSL function code
	 */
	public getContextAwareGlslFunction(
		def: ProcessedTransform,
		name: string,
		currentTarget: CompilationTarget,
		externalRef?: ExternalLayerReference,
		getExternalPrefix?: (layerId: string) => string
	): string {
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
	 * Handles context-aware naming for src() operations.
	 */
	public getFunctionName(
		def: ProcessedTransform,
		currentTarget: CompilationTarget,
		externalRef?: ExternalLayerReference,
		getExternalPrefix?: (layerId: string) => string
	): string {
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
		getExternalPrefix?: (layerId: string) => string
	): TransformCodeResult {
		// Get the function name to call
		const funcName = this.getFunctionName(def, currentTarget, externalRef, getExternalPrefix);

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
}
