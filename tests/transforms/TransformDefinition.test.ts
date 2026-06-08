import { describe, it, expect } from 'vitest';
import { processTransform, defineTransform, type TransformDefinition } from '../../src/transforms/TransformDefinition';

describe('TransformDefinition', () => {
	describe('defineTransform', () => {
		it('should return the definition as-is', () => {
			const def: TransformDefinition = {
				name: 'test',
				type: 'color',
				inputs: [],
				glsl: 'return _c0;',
			};

			const result = defineTransform(def);
			expect(result).toBe(def);
		});
	});

	describe('processTransform', () => {
		it('should generate GLSL function for "src" type', () => {
			const def: TransformDefinition = {
				name: 'mySrc',
				type: 'src',
				inputs: [],
				glsl: 'return vec4(1.0);',
			};

			const processed = processTransform(def);

			expect(processed.glslName).toBe('tm_mySrc');
			expect(processed.glslFunction).toContain('vec4 tm_mySrc(vec2 _st)');
			expect(processed.glslFunction).toContain('return vec4(1.0);');
		});

		it('should generate GLSL function for "coord" type', () => {
			const def: TransformDefinition = {
				name: 'myCoord',
				type: 'coord',
				inputs: [],
				glsl: 'return _st;',
			};

			const processed = processTransform(def);

			expect(processed.glslName).toBe('tm_myCoord');
			expect(processed.glslFunction).toContain('vec2 tm_myCoord(vec2 _st)');
			expect(processed.glslFunction).toContain('return _st;');
		});

		it('should generate GLSL function for "color" type', () => {
			const def: TransformDefinition = {
				name: 'myColor',
				type: 'color',
				inputs: [],
				glsl: 'return _c0;',
			};

			const processed = processTransform(def);

			expect(processed.glslName).toBe('tm_myColor');
			expect(processed.glslFunction).toContain('vec4 tm_myColor(vec4 _c0)');
			expect(processed.glslFunction).toContain('return _c0;');
		});

		it('should generate GLSL function for "combine" type', () => {
			const def: TransformDefinition = {
				name: 'myCombine',
				type: 'combine',
				inputs: [],
				glsl: 'return mix(_c0, _c1, 0.5);',
			};

			const processed = processTransform(def);

			expect(processed.glslName).toBe('tm_myCombine');
			expect(processed.glslFunction).toContain('vec4 tm_myCombine(vec4 _c0, vec4 _c1)');
			expect(processed.glslFunction).toContain('return mix(_c0, _c1, 0.5);');
		});

		it('should generate GLSL function for "combineCoord" type', () => {
			const def: TransformDefinition = {
				name: 'myCombineCoord',
				type: 'combineCoord',
				inputs: [],
				glsl: 'return _st;',
			};

			const processed = processTransform(def);

			expect(processed.glslName).toBe('tm_myCombineCoord');
			expect(processed.glslFunction).toContain('vec2 tm_myCombineCoord(vec2 _st, vec4 _c0)');
			expect(processed.glslFunction).toContain('return _st;');
		});

		it('should include input parameters in function signature', () => {
			const def: TransformDefinition = {
				name: 'paramTest',
				type: 'color',
				inputs: [
					{ name: 'amount', type: 'float', default: 0.5 },
					{ name: 'scale', type: 'vec2', default: [1, 1] },
				],
				glsl: 'return _c0;',
			};

			const processed = processTransform(def);

			// Should contain standard arg (_c0) followed by inputs
			expect(processed.glslFunction).toContain('vec4 tm_paramTest(vec4 _c0, float amount, vec2 scale)');
		});

		it('should avoid GLSL built-in names in generated functions and parameters', () => {
			const def: TransformDefinition = {
				name: 'clamp',
				type: 'color',
				inputs: [
					{ name: 'min', type: 'float', default: 0.0 },
					{ name: 'max', type: 'float', default: 1.0 },
				],
				glsl: 'return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);',
			};

			const processed = processTransform(def);

			expect(processed.name).toBe('clamp');
			expect(processed.glslName).toBe('tm_clamp');
			expect(processed.glslFunction).toContain('vec4 tm_clamp(vec4 _c0, float tm_min, float tm_max)');
			expect(processed.glslFunction).not.toContain('vec4 clamp(');
			expect(processed.glslFunction).not.toContain('float min');
			expect(processed.glslFunction).not.toContain('float max');
			expect(processed.glslFunction).toContain('vec3(tm_min)');
			expect(processed.glslFunction).toContain('vec3(tm_max)');
		});
	});
});
