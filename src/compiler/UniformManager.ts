/**
 * UniformManager - Handles uniform extraction and management.
 * 
 * This module processes transform arguments and creates uniform
 * definitions for dynamic values that need to be updated each frame.
 */

import type { SynthParameterValue, SynthContext, SynthUniform, GLSLType } from '../core/types';
import type { TransformInput } from '../transforms/TransformDefinition';
import { getArrayValue, isModulatedArray, type ModulatedArray } from '../lib/ArrayUtils';

/**
 * Result of processing a single argument.
 */
export interface ProcessedArgument {
	/** GLSL code to use in function call */
	glslValue: string;
	/** Uniform created (if any) */
	uniform?: SynthUniform;
	/** Dynamic updater (if any) */
	updater?: (ctx: SynthContext) => number | number[];
}

/**
 * Manager for shader uniforms.
 */
export class UniformManager {
	private readonly _uniforms = new Map<string, SynthUniform>();
	private readonly _dynamicUpdaters = new Map<string, (ctx: SynthContext) => number | number[]>();

	/**
	 * Process an argument and return its GLSL representation.
	 */
	public processArgument(
		value: SynthParameterValue,
		input: TransformInput,
		prefix: string
	): ProcessedArgument {
		// Modulated array (Hydra-style) - create uniform
		if (isModulatedArray(value)) {
			const uniformName = `${prefix}_${input.name}`;
			const uniform: SynthUniform = {
				name: uniformName,
				type: input.type as GLSLType,
				value: (input.default as number) ?? 0,
				isDynamic: true,
			};
			
			const updater = (ctx: SynthContext) => getArrayValue(value as ModulatedArray, ctx);
			this._uniforms.set(uniformName, uniform);
			this._dynamicUpdaters.set(uniformName, updater);
			
			return {
				glslValue: uniformName,
				uniform,
				updater,
			};
		}

		// Dynamic function value - create uniform
		if (typeof value === 'function') {
			const uniformName = `${prefix}_${input.name}`;
			const uniform: SynthUniform = {
				name: uniformName,
				type: input.type as GLSLType,
				value: (input.default as number) ?? 0,
				isDynamic: true,
			};
			
			this._uniforms.set(uniformName, uniform);
			this._dynamicUpdaters.set(uniformName, value as (ctx: SynthContext) => number);
			
			return {
				glslValue: uniformName,
				uniform,
				updater: value as (ctx: SynthContext) => number,
			};
		}

		// Static number value
		if (typeof value === 'number') {
			return { glslValue: formatNumber(value) };
		}

		// Array value (vectors)
		if (Array.isArray(value) && typeof value[0] === 'number') {
			const nums = value as number[];
			if (nums.length === 2) {
				return { glslValue: `vec2(${formatNumber(nums[0])}, ${formatNumber(nums[1])})` };
			} else if (nums.length === 3) {
				return { glslValue: `vec3(${formatNumber(nums[0])}, ${formatNumber(nums[1])}, ${formatNumber(nums[2])})` };
			} else if (nums.length === 4) {
				return { glslValue: `vec4(${formatNumber(nums[0])}, ${formatNumber(nums[1])}, ${formatNumber(nums[2])}, ${formatNumber(nums[3])})` };
			}
		}

		// Null or undefined - use default
		if (value === null || value === undefined) {
			return this.processDefault(input);
		}

		// Fallback to default
		return this.processDefault(input);
	}

	/**
	 * Process default value for an input.
	 */
	private processDefault(input: TransformInput): ProcessedArgument {
		const def = input.default;
		if (typeof def === 'number') {
			return { glslValue: formatNumber(def) };
		} else if (Array.isArray(def)) {
			return { glslValue: `vec${def.length}(${def.map(formatNumber).join(', ')})` };
		}
		return { glslValue: '0.0' };
	}

	/**
	 * Get all collected uniforms.
	 */
	public getUniforms(): Map<string, SynthUniform> {
		return new Map(this._uniforms);
	}

	/**
	 * Get all dynamic updaters.
	 */
	public getDynamicUpdaters(): Map<string, (ctx: SynthContext) => number | number[]> {
		return new Map(this._dynamicUpdaters);
	}

	/**
	 * Clear all collected data.
	 */
	public clear(): void {
		this._uniforms.clear();
		this._dynamicUpdaters.clear();
	}
}

/**
 * Format a number for GLSL (ensure decimal point for floats).
 */
export function formatNumber(n: number): string {
	const s = n.toString();
	return s.includes('.') ? s : s + '.0';
}
