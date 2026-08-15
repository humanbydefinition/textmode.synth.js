import { describe, it, expect } from 'vitest';
import { defineTransform, type TransformDefinition } from '../../src/transforms/TransformDefinition';

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
});
