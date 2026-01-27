import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transformRegistry } from '../../src/transforms/TransformRegistry';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

describe('TransformRegistry', () => {
	// Test data
	const mockTransform1: TransformDefinition = {
		name: 'mock1',
		type: 'color',
		inputs: [],
		glsl: 'return _c0;',
		description: 'Mock transform 1',
	};

	const mockTransform2: TransformDefinition = {
		name: 'mock2',
		type: 'coord',
		inputs: [{ name: 'amount', type: 'float', default: 1.0 }],
		glsl: 'return _st * amount;',
		description: 'Mock transform 2',
	};

	const mockSourceTransform: TransformDefinition = {
		name: 'mockSource',
		type: 'src',
		inputs: [],
		glsl: 'return vec4(1.0);',
		description: 'Mock source transform',
	};

	beforeEach(() => {
		transformRegistry.clear();
	});

	afterEach(() => {
		transformRegistry.clear();
		vi.restoreAllMocks();
	});

	describe('register', () => {
		it('should register a transform and retrieve it', () => {
			transformRegistry.register(mockTransform1);
			expect(transformRegistry.get('mock1')).toBe(mockTransform1);
			expect(transformRegistry.has('mock1')).toBe(true);
		});

		it('should warn when overwriting an existing transform', () => {
			const consoleSpy = vi.spyOn(console, 'warn');
			transformRegistry.register(mockTransform1);
			transformRegistry.register(mockTransform1);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Overwriting existing transform: mock1')
			);
		});

		it('should invalidate processed cache on overwrite', () => {
			transformRegistry.register(mockTransform1);
			// Trigger processing
			const p1 = transformRegistry.getProcessed('mock1');
			expect(p1).toBeDefined();

			// Overwrite
			const newTransform = { ...mockTransform1, glsl: 'return _c0 * 0.5;' };
			transformRegistry.register(newTransform);

			// Should be new definition
			expect(transformRegistry.get('mock1')).toBe(newTransform);

			// Processed cache should be regenerated (new reference)
			const p2 = transformRegistry.getProcessed('mock1');
			expect(p2).not.toBe(p1);
			expect(p2?.glslFunction).toContain('return _c0 * 0.5;');
		});
	});

	describe('registerMany', () => {
		it('should register multiple transforms', () => {
			transformRegistry.registerMany([mockTransform1, mockTransform2]);
			expect(transformRegistry.has('mock1')).toBe(true);
			expect(transformRegistry.has('mock2')).toBe(true);
			expect(transformRegistry.size).toBe(2);
		});
	});

	describe('get', () => {
		it('should return undefined for non-existent transform', () => {
			expect(transformRegistry.get('nonexistent')).toBeUndefined();
		});
	});

	describe('getProcessed', () => {
		it('should return processed transform with GLSL function', () => {
			transformRegistry.register(mockTransform1);
			const processed = transformRegistry.getProcessed('mock1');

			expect(processed).toBeDefined();
			expect(processed?.name).toBe('mock1');
			// Check if GLSL function wrapper is generated
			expect(processed?.glslFunction).toContain('vec4 mock1(vec4 _c0)');
			expect(processed?.glslFunction).toContain('return _c0;');
		});

		it('should cache processed transforms', () => {
			transformRegistry.register(mockTransform1);
			const p1 = transformRegistry.getProcessed('mock1');
			const p2 = transformRegistry.getProcessed('mock1');

			expect(p1).toBe(p2);
		});

		it('should return undefined for non-existent transform', () => {
			expect(transformRegistry.getProcessed('nonexistent')).toBeUndefined();
		});
	});

	describe('getByType', () => {
		it('should filter transforms by type', () => {
			transformRegistry.registerMany([
				mockTransform1, // color
				mockTransform2, // coord
				mockSourceTransform, // src
			]);

			const colorTransforms = transformRegistry.getByType('color');
			expect(colorTransforms).toHaveLength(1);
			expect(colorTransforms[0]).toBe(mockTransform1);

			const coordTransforms = transformRegistry.getByType('coord');
			expect(coordTransforms).toHaveLength(1);
			expect(coordTransforms[0]).toBe(mockTransform2);
		});
	});

	describe('getSourceTransforms', () => {
		it('should return only src type transforms', () => {
			transformRegistry.registerMany([
				mockTransform1,
				mockSourceTransform,
			]);

			const sources = transformRegistry.getSourceTransforms();
			expect(sources).toHaveLength(1);
			expect(sources[0]).toBe(mockSourceTransform);
		});
	});

	describe('collections', () => {
		it('should return all names', () => {
			transformRegistry.registerMany([mockTransform1, mockTransform2]);
			const names = transformRegistry.getNames();
			expect(names).toContain('mock1');
			expect(names).toContain('mock2');
			expect(names).toHaveLength(2);
		});

		it('should return all transforms', () => {
			transformRegistry.registerMany([mockTransform1, mockTransform2]);
			const all = transformRegistry.getAll();
			expect(all).toContain(mockTransform1);
			expect(all).toContain(mockTransform2);
			expect(all).toHaveLength(2);
		});
	});

	describe('remove', () => {
		it('should remove a transform', () => {
			transformRegistry.register(mockTransform1);
			expect(transformRegistry.has('mock1')).toBe(true);

			const result = transformRegistry.remove('mock1');
			expect(result).toBe(true);
			expect(transformRegistry.has('mock1')).toBe(false);
		});

		it('should return false when removing non-existent transform', () => {
			expect(transformRegistry.remove('nonexistent')).toBe(false);
		});

		it('should invalidate processed cache on removal', () => {
			transformRegistry.register(mockTransform1);
			transformRegistry.getProcessed('mock1'); // Cache it

			transformRegistry.remove('mock1');
			expect(transformRegistry.getProcessed('mock1')).toBeUndefined();
		});
	});

	describe('clear', () => {
		it('should remove all transforms', () => {
			transformRegistry.registerMany([mockTransform1, mockTransform2]);
			expect(transformRegistry.size).toBe(2);

			transformRegistry.clear();
			expect(transformRegistry.size).toBe(0);
			expect(transformRegistry.getAll()).toHaveLength(0);
		});
	});
});
