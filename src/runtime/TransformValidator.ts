/**
 * TransformValidator - Synchronous definition normalization and validation.
 *
 * Normalizes a caller-provided {@link TransformDefinition} into an immutable
 * {@link NormalizedTransformDefinition} before any runtime state is mutated.
 * Validation failures are synchronous and do not mutate runtime state.
 *
 * This module deliberately does not attempt to validate arbitrary GLSL with
 * regular expressions. Schema validation is synchronous; full GLSL validation
 * belongs to WebGL compilation.
 */

import { TRANSFORM_TYPE_INFO } from '../core/types';
import type { GLSLType, SynthTransformType } from '../core/types';
import type {
	NormalizedTransformDefinition,
	NormalizedTransformInput,
	TransformDefinition,
	TransformInput,
} from '../transforms/TransformDefinition';
import { GLSL_RESERVED_IDENTIFIERS } from '../transforms/TransformDefinition';

/**
 * Configurable limits that prevent accidental editor lockups from
 * pathological extension definitions.
 */
export interface ValidationLimits {
	/** Maximum length of the public function name. */
	readonly maxNameLength?: number;
	/** Maximum number of declared inputs. */
	readonly maxInputs?: number;
	/** Maximum GLSL body length in characters. */
	readonly maxGlslLength?: number;
}

export const DEFAULT_VALIDATION_LIMITS: Required<ValidationLimits> = {
	maxNameLength: 64,
	maxInputs: 16,
	maxGlslLength: 8192,
};

/**
 * Error thrown for invalid extension definitions. The `phase` is always
 * `'definition'`; keeping it on the error lets live-coding environments map
 * failures to the documented structured phase vocabulary.
 */
export class TransformDefinitionError extends Error {
	public readonly phase = 'definition' as const;
	public readonly transformName: string;

	public constructor(message: string, transformName: string) {
		super(`[textmode.synth.js] Invalid transform definition "${transformName}": ${message}`);
		this.name = 'TransformDefinitionError';
		this.transformName = transformName;
	}
}

/** Dangerous names that must never be bound as chain methods or globals. */
const FORBIDDEN_NAMES = new Set<string>([
	'__proto__',
	'prototype',
	'constructor',
	'toString',
	'hasOwnProperty',
	'valueOf',
	'isPrototypeOf',
	'propertyIsEnumerable',
	'toLocaleString',
]);

/** Core SynthSource members that a custom chain method must not shadow. */
const CORE_SYNTH_SOURCE_MEMBERS = new Set<string>([
	'addTransform',
	'addCombineTransform',
	'addExternalLayerRef',
	'addTextmodeSourceRef',
	'transform',
	'charMap',
	'charColor',
	'cellColor',
	'paint',
	'char',
	'clone',
	'transforms',
	'charMapping',
	'charColorSource',
	'cellColorSource',
	'charSource',
	'nestedSources',
	'externalLayerRefs',
	'textmodeSourceRefs',
]);

/** Implicit GLSL arguments that user inputs must not collide with. */
const IMPLICIT_INPUT_NAMES = new Set(['_st', '_c0', '_c1']);

const IDENTIFIER_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const VECTOR_SIZES: Record<string, number> = { vec2: 2, vec3: 3, vec4: 4 };

function assertPlainObject(value: unknown, transformName: string): asserts value is Record<string, unknown> {
	if (value === null || typeof value !== 'object' || Array.isArray(value)) {
		throw new TransformDefinitionError('definition must be a plain object', transformName);
	}
}

function assertValidName(name: unknown, transformName: string, maxLength: number): void {
	if (typeof name !== 'string' || name.length === 0) {
		throw new TransformDefinitionError('name must be a non-empty string', transformName);
	}
	if (name.length > maxLength) {
		throw new TransformDefinitionError(`name exceeds the ${maxLength} character limit`, transformName);
	}
	if (!IDENTIFIER_PATTERN.test(name)) {
		throw new TransformDefinitionError(`"${name}" is not a valid JavaScript identifier`, String(transformName));
	}
	if (FORBIDDEN_NAMES.has(name)) {
		throw new TransformDefinitionError(`"${name}" is a reserved name`, transformName);
	}
	if (CORE_SYNTH_SOURCE_MEMBERS.has(name)) {
		throw new TransformDefinitionError(`"${name}" collides with a core SynthSource member`, transformName);
	}
}

function assertTransformType(type: unknown, transformName: string): asserts type is SynthTransformType {
	if (typeof type !== 'string' || !(type in TRANSFORM_TYPE_INFO)) {
		throw new TransformDefinitionError(
			`unknown transform type "${String(type)}". Expected one of: ${Object.keys(TRANSFORM_TYPE_INFO).join(', ')}`,
			transformName
		);
	}
}

function assertInputName(name: unknown, transformName: string, index: number): void {
	if (typeof name !== 'string' || !IDENTIFIER_PATTERN.test(name)) {
		throw new TransformDefinitionError(`input[${index}] name must be a valid identifier`, transformName);
	}
	if (IMPLICIT_INPUT_NAMES.has(name)) {
		throw new TransformDefinitionError(
			`input[${index}] name "${name}" collides with an implicit transform argument`,
			transformName
		);
	}
}

function assertDefaultValue(input: TransformInput, transformName: string, index: number): void {
	const type = input.type as GLSLType;
	const def = input.default;

	if (type === 'sampler2D') {
		if (def !== null) {
			throw new TransformDefinitionError(
				`input[${index}] "${input.name}" of type sampler2D must have a null default`,
				transformName
			);
		}
		return;
	}

	if (type === 'float' || type === 'int') {
		if (typeof def !== 'number' || !Number.isFinite(def)) {
			throw new TransformDefinitionError(
				`input[${index}] "${input.name}" of type ${type} must have a finite number default`,
				transformName
			);
		}
		if (type === 'int' && !Number.isInteger(def)) {
			throw new TransformDefinitionError(
				`input[${index}] "${input.name}" of type int must have an integral default`,
				transformName
			);
		}
		return;
	}

	const size = VECTOR_SIZES[type];
	if (typeof size === 'number') {
		if (
			!Array.isArray(def) ||
			def.length !== size ||
			!def.every((component) => typeof component === 'number' && Number.isFinite(component))
		) {
			throw new TransformDefinitionError(
				`input[${index}] "${input.name}" of type ${type} must default to an array of exactly ${size} finite numbers`,
				transformName
			);
		}
	}
}

/**
 * Normalize a caller-provided definition into an immutable internal record.
 * The returned object is deeply frozen; callers cannot mutate a registered
 * definition later.
 */
export function normalizeDefinition(
	def: TransformDefinition,
	limits?: ValidationLimits
): NormalizedTransformDefinition {
	const resolvedLimits = { ...DEFAULT_VALIDATION_LIMITS, ...limits };

	assertPlainObject(def, String(def?.name ?? '<unknown>'));
	const transformName = String(def.name ?? '<unknown>');

	assertValidName(def.name, transformName, resolvedLimits.maxNameLength);
	assertTransformType(def.type, transformName);

	const inputSource = def.inputs;
	if (!Array.isArray(inputSource)) {
		throw new TransformDefinitionError('inputs must be an array', transformName);
	}
	if (inputSource.length > resolvedLimits.maxInputs) {
		throw new TransformDefinitionError(`inputs exceeds the ${resolvedLimits.maxInputs} input limit`, transformName);
	}

	const seen = new Set<string>();
	const inputs: NormalizedTransformInput[] = inputSource.map((input, index) => {
		if (input === null || typeof input !== 'object') {
			throw new TransformDefinitionError(`input[${index}] must be an object`, transformName);
		}
		const publicName = input.name;
		assertInputName(publicName, transformName, index);
		if (seen.has(publicName)) {
			throw new TransformDefinitionError(`input[${index}] duplicate input name "${publicName}"`, transformName);
		}
		seen.add(publicName);

		const type = input.type as GLSLType;
		const supportedTypes = new Set(['float', 'int', 'vec2', 'vec3', 'vec4', 'sampler2D']);
		if (typeof type !== 'string' || !supportedTypes.has(type)) {
			throw new TransformDefinitionError(
				`input[${index}] "${publicName}" has unsupported GLSL type "${String(type)}"`,
				transformName
			);
		}

		assertDefaultValue(input, transformName, index);

		return {
			name: toSafeGlslIdentifier(publicName),
			publicName,
			type,
			default: Array.isArray(input.default) ? [...input.default] : input.default,
		};
	});

	const glsl = def.glsl;
	if (typeof glsl !== 'string' || glsl.trim().length === 0) {
		throw new TransformDefinitionError('glsl body must be a non-empty string', transformName);
	}
	if (glsl.length > resolvedLimits.maxGlslLength) {
		throw new TransformDefinitionError(
			`glsl body exceeds the ${resolvedLimits.maxGlslLength} character limit`,
			transformName
		);
	}

	const normalized: NormalizedTransformDefinition = {
		name: transformName,
		type: def.type as SynthTransformType,
		inputs,
		glsl: rewriteInputNames(glsl, inputs),
		...(def.description !== undefined ? { description: String(def.description) } : {}),
	};

	return deepFreeze(normalized);
}

/**
 * Rewrite public input names to their safe GLSL identifiers in the body.
 * This is the same renaming `processTransform` performed, applied once at
 * normalization time so the registered definition is fully self-contained.
 */
function rewriteInputNames(glsl: string, inputs: readonly NormalizedTransformInput[]): string {
	return inputs.reduce((body, input) => {
		if (input.name === input.publicName) return body;
		return body.replace(new RegExp(`\\b${escapeRegExp(input.publicName)}\\b`, 'g'), input.name);
	}, glsl);
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Return a GLSL-safe identifier for a user-provided input name, prefixing
 * names that collide with GLSL built-in functions.
 */
export function toSafeGlslIdentifier(name: string): string {
	return GLSL_RESERVED_IDENTIFIERS.has(name) ? `tm_${name}` : name;
}

function deepFreeze<T>(value: T): T {
	if (value === null || typeof value !== 'object') return value;
	for (const key of Object.keys(value)) {
		deepFreeze((value as Record<string, unknown>)[key]);
	}
	return Object.freeze(value) as T;
}
