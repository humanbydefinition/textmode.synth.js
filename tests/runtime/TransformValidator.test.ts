import { describe, it, expect } from 'vitest';
import { normalizeDefinition, TransformDefinitionError } from '../../src/runtime/TransformValidator';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

const VALID_DEFINITIONS: TransformDefinition[] = [
	{
		name: 'waves',
		type: 'src',
		inputs: [{ name: 'freq', type: 'float', default: 4 }],
		glsl: 'return vec4(vec3(_st.x * freq), 1.0);',
	},
	{
		name: 'squish',
		type: 'coord',
		inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
		glsl: 'return _st * amount;',
	},
	{
		name: 'tint',
		type: 'color',
		inputs: [{ name: 'r', type: 'float', default: 1 }],
		glsl: 'return vec4(_c0.rgb * r, _c0.a);',
	},
	{
		name: 'mixer',
		type: 'combine',
		inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
		glsl: 'return mix(_c0, _c1, amount);',
	},
	{
		name: 'warp',
		type: 'combineCoord',
		inputs: [{ name: 'amount', type: 'float', default: 1 }],
		glsl: 'return _st + _c0.xy * amount;',
	},
	{
		name: 'duotone',
		type: 'color',
		inputs: [
			{ name: 'low', type: 'vec3', default: [0.02, 0.04, 0.12] },
			{ name: 'high', type: 'vec3', default: [1.0, 0.4, 0.1] },
		],
		glsl: 'float value = _luminance(_c0.rgb); return vec4(mix(low, high, value), _c0.a);',
	},
	{
		name: 'noiseSampler',
		type: 'color',
		inputs: [{ name: 'tex', type: 'sampler2D', default: null }],
		glsl: 'return vec4(1.0);',
	},
	{
		name: 'countdown',
		type: 'color',
		inputs: [{ name: 'steps', type: 'int', default: 8 }],
		glsl: 'return _c0 * float(steps);',
	},
];

describe('TransformValidator', () => {
	describe('normalizeDefinition', () => {
		it('accepts a valid definition of every transform type', () => {
			for (const def of VALID_DEFINITIONS) {
				const normalized = normalizeDefinition(def);
				expect(normalized.name).toBe(def.name);
				expect(normalized.type).toBe(def.type);
				expect(normalized.inputs).toHaveLength(def.inputs.length);
			}
		});

		it('deep-freezes the normalized record so callers cannot mutate it later', () => {
			const def = VALID_DEFINITIONS[0];
			const normalized = normalizeDefinition(def);
			expect(Object.isFrozen(normalized)).toBe(true);
			expect(Object.isFrozen(normalized.inputs)).toBe(true);
			expect(Object.isFrozen(normalized.inputs[0])).toBe(true);
			expect(() => {
				(normalized as { name: string }).name = 'changed';
			}).toThrow();
		});

		it('does not retain or mutate caller-provided objects', () => {
			const inputs = [{ name: 'freq', type: 'float' as const, default: 4 }];
			const def: TransformDefinition = { name: 'waves', type: 'src', inputs, glsl: 'return vec4(1.0);' };
			const normalized = normalizeDefinition(def);
			expect(normalized.inputs[0]).not.toBe(inputs[0]);
			expect(Object.isFrozen(normalized.inputs[0])).toBe(true);
			// Mutating the caller's array after normalization is safe.
			inputs[0].default = 999;
			expect(normalized.inputs[0].default).toBe(4);
		});

		it('rejects a missing or invalid name', () => {
			expect(() => normalizeDefinition({ name: '', type: 'color', inputs: [], glsl: 'return _c0;' })).toThrow(
				TransformDefinitionError
			);
			expect(() =>
				normalizeDefinition({ name: 'not valid!', type: 'color', inputs: [], glsl: 'return _c0;' })
			).toThrow(TransformDefinitionError);
		});

		it('rejects dangerous and core-member names', () => {
			for (const name of ['__proto__', 'prototype', 'constructor', 'charMap', 'clone', 'transform']) {
				expect(() => normalizeDefinition({ name, type: 'color', inputs: [], glsl: 'return _c0;' })).toThrow(
					TransformDefinitionError
				);
			}
		});

		it('rejects unknown transform types', () => {
			expect(() =>
				normalizeDefinition({ name: 'bad', type: 'fragment' as never, inputs: [], glsl: 'return vec4(1.0);' })
			).toThrow(TransformDefinitionError);
		});

		it('rejects duplicate input names', () => {
			expect(() =>
				normalizeDefinition({
					name: 'dup',
					type: 'color',
					inputs: [
						{ name: 'amount', type: 'float', default: 1 },
						{ name: 'amount', type: 'float', default: 2 },
					],
					glsl: 'return _c0;',
				})
			).toThrow(/duplicate input name "amount"/);
		});

		it('rejects inputs colliding with implicit arguments', () => {
			for (const name of ['_st', '_c0', '_c1']) {
				expect(() =>
					normalizeDefinition({
						name: 'clash',
						type: 'color',
						inputs: [{ name, type: 'float', default: 1 }],
						glsl: 'return _c0;',
					})
				).toThrow(TransformDefinitionError);
			}
		});

		it('rejects unsupported GLSL input types', () => {
			expect(() =>
				normalizeDefinition({
					name: 'badtype',
					type: 'color',
					inputs: [{ name: 'x', type: 'bool' as never, default: 1 }],
					glsl: 'return _c0;',
				})
			).toThrow(TransformDefinitionError);
		});

		it('validates default shapes against declared types', () => {
			// vec3 needs exactly 3 numbers
			expect(() =>
				normalizeDefinition({
					name: 'badvec',
					type: 'color',
					inputs: [{ name: 'v', type: 'vec3', default: [1, 2] }],
					glsl: 'return _c0;',
				})
			).toThrow(TransformDefinitionError);
			// int needs an integral default
			expect(() =>
				normalizeDefinition({
					name: 'badint',
					type: 'color',
					inputs: [{ name: 'n', type: 'int', default: 2.5 }],
					glsl: 'return _c0;',
				})
			).toThrow(/integral/);
			// sampler2D needs a null default
			expect(() =>
				normalizeDefinition({
					name: 'badsampler',
					type: 'color',
					inputs: [{ name: 'tex', type: 'sampler2D', default: 1 }],
					glsl: 'return _c0;',
				})
			).toThrow(/null default/);
		});

		it('rejects an empty or non-string GLSL body', () => {
			expect(() => normalizeDefinition({ name: 'empty', type: 'color', inputs: [], glsl: '   ' })).toThrow(
				TransformDefinitionError
			);
			expect(() => normalizeDefinition({ name: 'empty', type: 'color', inputs: [], glsl: '' })).toThrow(
				TransformDefinitionError
			);
		});

		it('rejects inputs and names beyond configured limits', () => {
			const tooManyInputs = Array.from({ length: 17 }, (_, i) => ({
				name: `x${i}`,
				type: 'float' as const,
				default: 0,
			}));
			expect(() =>
				normalizeDefinition({ name: 'big', type: 'color', inputs: tooManyInputs, glsl: 'return _c0;' })
			).toThrow(/input limit/);

			expect(() =>
				normalizeDefinition({ name: 'x'.repeat(65), type: 'color', inputs: [], glsl: 'return _c0;' })
			).toThrow(/character limit/);
		});

		it('renames inputs that collide with GLSL built-ins inside the body', () => {
			const normalized = normalizeDefinition({
				name: 'clamp',
				type: 'color',
				inputs: [
					{ name: 'min', type: 'float', default: 0 },
					{ name: 'max', type: 'float', default: 1 },
				],
				glsl: 'return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);',
			});
			expect(normalized.inputs[0].name).toBe('tm_min');
			expect(normalized.inputs[0].publicName).toBe('min');
			expect(normalized.inputs[1].name).toBe('tm_max');
			expect(normalized.glsl).toContain('vec3(tm_min)');
			expect(normalized.glsl).not.toContain('vec3(min)');
		});
	});
});
