/**
 * Transform definition types and interfaces.
 *
 * This module provides the base types and helper functions for defining
 * synthesis transforms in a declarative way.
 */

import type { SynthTransformType, TransformInput } from '../core/types';
export type { TransformInput };
import { TRANSFORM_TYPE_INFO } from '../core/types';

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
	/** Complete GLSL function code */
	glslFunction: string;
}

/**
 * Process a transform definition into a processed transform with complete GLSL function.
 */
export function processTransform(def: TransformDefinition): ProcessedTransform {
	const typeInfo = TRANSFORM_TYPE_INFO[def.type];
	const allArgs = [...typeInfo.args, ...def.inputs.map((i) => ({ type: i.type, name: i.name }))];
	const argsStr = allArgs.map((a) => `${a.type} ${a.name}`).join(', ');

	const glslFunction = `
${typeInfo.returnType} ${def.name}(${argsStr}) {
${def.glsl}
}`;

	return {
		...def,
		glslFunction,
	};
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
