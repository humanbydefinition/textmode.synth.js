/**
 * Transform definition types and interfaces.
 *
 * This module provides the base types and helper functions for defining
 * synthesis transforms in a declarative way.
 */

import type { SynthTransformType, TransformInput } from '../core/types';
export type { TransformInput };
import { TRANSFORM_TYPE_INFO } from '../core/types';

const GLSL_RESERVED_IDENTIFIERS = new Set([
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
 */
export interface TransformDefinition {
	/** Function name (used in JS API and GLSL) */
	name: string;
	/** Transform type determining composition behavior */
	type: SynthTransformType;
	/** Input parameters */
	inputs: TransformInput[];
	/** GLSL function body (without function signature) */
	glsl: string;
	/** Optional description for documentation */
	description?: string;
}

/**
 * A processed transform with complete GLSL function.
 */
export interface ProcessedTransform extends TransformDefinition {
	/** Internal GLSL function name, kept separate from the public JS API name */
	glslName: string;
	/** Complete GLSL function code */
	glslFunction: string;
}

/**
 * Process a transform definition into a processed transform with complete GLSL function.
 */
export function processTransform(def: TransformDefinition): ProcessedTransform {
	const typeInfo = TRANSFORM_TYPE_INFO[def.type];
	const inputArgs = def.inputs.map((i) => ({ type: i.type, name: toSafeGlslIdentifier(i.name) }));
	const allArgs = [...typeInfo.args, ...inputArgs];
	const argsStr = allArgs.map((a) => `${a.type} ${a.name}`).join(', ');
	const glslName = `tm_${def.name}`;
	const glslBody = def.inputs.reduce((body, input) => {
		const safeName = toSafeGlslIdentifier(input.name);
		if (safeName === input.name) return body;
		return body.replace(new RegExp(`\\b${escapeRegExp(input.name)}\\b`, 'g'), safeName);
	}, def.glsl);

	const glslFunction = `
${typeInfo.returnType} ${glslName}(${argsStr}) {
${glslBody}
}`;

	return {
		...def,
		glslName,
		glslFunction,
	};
}

function toSafeGlslIdentifier(name: string): string {
	return GLSL_RESERVED_IDENTIFIERS.has(name) ? `tm_${name}` : name;
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
