/**
 * ArgumentLowerer - Type-directed lowering of transform arguments to GLSL.
 *
 * Behavior is determined by the declared input type:
 *
 * | Declared type | Static value | Dynamic value | Source/texture value |
 * | --- | --- | --- | --- |
 * | `float` | Number literal | Number uniform | Reject |
 * | `int` | Integer literal (no decimal suffix) | Integer uniform | Reject |
 * | `vec2/3/4` | Exact-length tuple → `vecN(...)` | Vector uniform | Reject (v1) |
 * | `sampler2D` | Sampler binding (handled by the compiler) | — | Accepted |
 *
 * Rules:
 * - For a `float` input, a number array keeps Hydra-like time-sequence
 *   semantics (a dynamic uniform).
 * - For a vector input, a number array is vector data, not a time sequence.
 * - Dynamic callbacks receive {@link SynthContext} and must return a value
 *   matching the declared input type.
 * - Integers never receive a decimal suffix.
 * - Defaults are applied only for omitted/`undefined` arguments.
 * - Invalid values fail at compile time rather than silently falling back.
 */

import type { SynthContext, SynthUniform, GLSLType } from '../core/types';
import { getArrayValue, isModulatedArray, type ModulatedArray } from '../utils/ArrayUtils';
import { createDynamicUpdater } from '../utils/SafeEvaluator';
import type { NormalizedTransformInput } from '../transforms/TransformDefinition';

export interface LoweredArgument {
	/** GLSL code to use in the function call. */
	readonly glslValue: string;
}

const VECTOR_SIZES: Record<string, number> = { vec2: 2, vec3: 3, vec4: 4 };

export class ArgumentLowerer {
	private readonly _uniforms = new Map<string, SynthUniform>();
	private readonly _dynamicUpdaters = new Map<string, (ctx: SynthContext) => number | number[]>();

	/**
	 * Lower a single argument against its declared input type.
	 *
	 * @param input The declared (normalized) input
	 * @param value The user-provided value or the input default
	 * @param prefix Uniform name prefix (stable across recompiles)
	 */
	public process(input: NormalizedTransformInput, value: unknown, prefix: string): LoweredArgument {
		if (input.type === 'float' || input.type === 'int') {
			return this._processScalar(input, value, prefix);
		}
		if (input.type === 'sampler2D') {
			throw new Error(
				`[textmode.synth.js] sampler2D input "${input.publicName}" must be lowered by the compiler sampler path.`
			);
		}
		return this._processVector(input, value, prefix);
	}

	private _processScalar(input: NormalizedTransformInput, value: unknown, prefix: string): LoweredArgument {
		const isFloat = input.type === 'float';

		// Dynamic function value - create a uniform updated each frame.
		if (typeof value === 'function') {
			return this._createDynamicUniform(input, prefix, value as (ctx: SynthContext) => number | number[]);
		}

		// Modulated array (float only) - Hydra-style time sequence.
		if (Array.isArray(value)) {
			if (isFloat && isModulatedArray(value)) {
				return this._createDynamicUniform(input, prefix, (ctx) => getArrayValue(value as ModulatedArray, ctx));
			}
			throw new Error(
				`[textmode.synth.js] Invalid value for ${input.type} input "${input.publicName}": expected a number, but received an array.`
			);
		}

		if (typeof value === 'number') {
			if (!isFloat && !Number.isInteger(value)) {
				throw new Error(
					`[textmode.synth.js] Invalid value for int input "${input.publicName}": expected an integer, received ${value}.`
				);
			}
			return { glslValue: isFloat ? formatNumber(value) : formatInt(value) };
		}

		if (value === null || value === undefined) {
			const def = input.default;
			if (typeof def === 'number') {
				return { glslValue: isFloat ? formatNumber(def) : formatInt(def) };
			}
		}

		throw new Error(`[textmode.synth.js] Invalid value for ${input.type} input "${input.publicName}".`);
	}

	private _processVector(input: NormalizedTransformInput, value: unknown, prefix: string): LoweredArgument {
		const size = VECTOR_SIZES[input.type];
		const name = input.publicName;

		// Dynamic function value - vector uniform updated each frame.
		if (typeof value === 'function') {
			return this._createDynamicUniform(input, prefix, value as (ctx: SynthContext) => number | number[]);
		}

		if (Array.isArray(value)) {
			if (value.length === size && value.every((component) => typeof component === 'number')) {
				return { glslValue: formatVector(input.type, value as number[]) };
			}
			throw new Error(
				`[textmode.synth.js] Invalid value for ${input.type} input "${name}": expected an array of exactly ${size} numbers. Vector time-sequences are not supported yet.`
			);
		}

		if (value === null || value === undefined) {
			const def = input.default;
			if (Array.isArray(def) && def.length === size) {
				return { glslValue: formatVector(input.type, def as readonly number[]) };
			}
		}

		throw new Error(`[textmode.synth.js] Invalid value for ${input.type} input "${name}".`);
	}

	private _createDynamicUniform(
		input: NormalizedTransformInput,
		prefix: string,
		updaterFn: (ctx: SynthContext) => number | number[]
	): LoweredArgument {
		const uniformName = `${prefix}_${input.name}`;
		const fallback: number | number[] =
			typeof input.default === 'number' ? input.default : Array.isArray(input.default) ? [...input.default] : 0;

		const uniform: SynthUniform = {
			name: uniformName,
			type: input.type as GLSLType,
			value: fallback,
			isDynamic: true,
		};

		const updater = createDynamicUpdater(updaterFn, uniformName, fallback);

		this._uniforms.set(uniformName, uniform);
		this._dynamicUpdaters.set(uniformName, updater);

		return { glslValue: uniformName };
	}

	/** All collected uniforms. */
	public getUniforms(): Map<string, SynthUniform> {
		return this._uniforms;
	}

	/** All dynamic updaters keyed by uniform name. */
	public getDynamicUpdaters(): Map<string, (ctx: SynthContext) => number | number[]> {
		return this._dynamicUpdaters;
	}

	/** Clear all collected state for a fresh compilation. */
	public clear(): void {
		this._uniforms.clear();
		this._dynamicUpdaters.clear();
	}
}

/**
 * Format a float for GLSL (ensure a decimal point).
 */
export function formatNumber(n: number): string {
	if (Number.isInteger(n)) {
		return n.toString() + '.0';
	}
	return n.toString();
}

/**
 * Format an integer for GLSL without a decimal suffix.
 */
export function formatInt(n: number): string {
	return Math.trunc(n).toString();
}

/**
 * Format a vector literal as `vecN(a, b, c)`.
 */
export function formatVector(type: string, components: readonly number[]): string {
	return `${type}(${components.map(formatNumber).join(', ')})`;
}
