/**
 * Transform definition types and interfaces.
 *
 * This module provides the base types and helper functions for defining
 * synthesis transforms in a declarative way.
 */

import type { GLSLType, SynthTransformType, TransformInput } from '../core/types';
export type { TransformInput };
import { TRANSFORM_TYPE_INFO } from '../core/types';

export const GLSL_RESERVED_IDENTIFIERS = new Set([
	'abs',
	'acos',
	'asin',
	'atan',
	'ceil',
	'clamp',
	'cos',
	'cross',
	'degrees',
	'distance',
	'dot',
	'equal',
	'exp',
	'exp2',
	'faceforward',
	'floor',
	'fract',
	'inverse',
	'inversesqrt',
	'length',
	'lessThan',
	'lessThanEqual',
	'log',
	'log2',
	'max',
	'min',
	'mix',
	'mod',
	'normalize',
	'not',
	'notEqual',
	'pow',
	'radians',
	'reflect',
	'refract',
	'sign',
	'sin',
	'smoothstep',
	'sqrt',
	'step',
	'tan',
	'texture',
]);

/**
 * Definition of a synthesis transform function.
 *
 * @category Extensibility
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition | TransformDefinition API reference}
 */
export interface TransformDefinition {
	/**
	 * Function name (used in JS API and GLSL)
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition#name | TransformDefinition.name API reference}
	 */
	name: string;
	/**
	 * Transform type determining composition behavior
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition#type | TransformDefinition.type API reference}
	 */
	type: SynthTransformType;
	/**
	 * Input parameters
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition#inputs | TransformDefinition.inputs API reference}
	 */
	inputs: TransformInput[];
	/**
	 * GLSL function body (without function signature)
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition#glsl | TransformDefinition.glsl API reference}
	 */
	glsl: string;
	/**
	 * Optional description for documentation
	 *
	 * @see {@link https://code.textmode.art/api/textmode.synth.js/interfaces/TransformDefinition#description | TransformDefinition.description API reference}
	 */
	description?: string;
}

/**
 * A normalized, immutable transform input after validation.
 */
export interface NormalizedTransformInput {
	/** GLSL-safe identifier used inside the generated function */
	readonly name: string;
	/** The caller-provided input name */
	readonly publicName: string;
	/** GLSL type */
	readonly type: GLSLType;
	/** Default value validated against the declared type */
	readonly default: number | readonly number[] | null;
}

/**
 * A normalized, immutable transform definition after validation.
 */
export interface NormalizedTransformDefinition {
	readonly name: string;
	readonly type: SynthTransformType;
	readonly inputs: readonly NormalizedTransformInput[];
	readonly glsl: string;
	readonly description?: string;
}

/**
 * Options for building a registered transform.
 */
export interface BuildRegisteredTransformOptions {
	/** Unique identifier for this registration */
	readonly id: symbol;
	/** Whether this registration is a built-in definition */
	readonly builtIn: boolean;
}

/**
 * An immutable registration captured by chain nodes.
 *
 * Chain nodes capture this record when a chain method is called, so
 * redefining or disposing a transform affects future chains only.
 */
export interface RegisteredTransform {
	readonly id: symbol;
	/** Public name used by the JavaScript API */
	readonly name: string;
	readonly type: SynthTransformType;
	readonly inputs: readonly NormalizedTransformInput[];
	readonly glsl: string;
	readonly description?: string;
	/** Internal GLSL function name (prefixed to avoid collisions) */
	readonly glslName: string;
	/** Complete GLSL function code */
	readonly glslFunction: string;
	readonly builtIn: boolean;
}

/**
 * Build a complete, immutable registered transform from a normalized definition.
 * The GLSL function signature is derived from the transform type and inputs.
 */
export function buildRegisteredTransform(
	normalized: NormalizedTransformDefinition,
	options: BuildRegisteredTransformOptions
): RegisteredTransform {
	const typeInfo = TRANSFORM_TYPE_INFO[normalized.type];
	const inputArgs = normalized.inputs.map((input) => ({ type: input.type, name: input.name }));
	const allArgs = [...typeInfo.args, ...inputArgs];
	const argsStr = allArgs.map((a) => `${a.type} ${a.name}`).join(', ');
	const glslName = `tm_${normalized.name}`;

	const glslFunction = `
${typeInfo.returnType} ${glslName}(${argsStr}) {
${normalized.glsl}
}`;

	return Object.freeze({
		id: options.id,
		name: normalized.name,
		type: normalized.type,
		inputs: normalized.inputs,
		glsl: normalized.glsl,
		...(normalized.description !== undefined ? { description: normalized.description } : {}),
		glslName,
		glslFunction,
		builtIn: options.builtIn,
	});
}

/**
 * Helper to define a transform with type inference.
 * This makes transform definitions more concise and type-safe.
 */
export function defineTransform<T extends SynthTransformType>(
	definition: TransformDefinition & { type: T }
): TransformDefinition {
	return definition;
}
