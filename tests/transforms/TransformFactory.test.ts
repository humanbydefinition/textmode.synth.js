import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transformFactory } from '../../src/transforms/TransformFactory';
import { transformRegistry } from '../../src/transforms/TransformRegistry';
import type { SynthSourcePrototype } from '../../src/transforms/TransformFactory';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';
import type { SynthParameterValue } from '../../src/core/types';

describe('TransformFactory', () => {
	let MockSynthSource: new () => SynthSourcePrototype;

	const mockTransform: TransformDefinition = {
		name: 'mockEffect',
		type: 'color',
		inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
		glsl: 'return _c0;',
	};

	const mockCombineTransform: TransformDefinition = {
		name: 'mockCombine',
		type: 'combine',
		inputs: [{ name: 'mix', type: 'float', default: 0.5 }],
		glsl: 'return mix(_c0, _c1, mix);',
	};

	const mockSrcTransform: TransformDefinition = {
		name: 'mockSrc',
		type: 'src',
		inputs: [{ name: 'freq', type: 'float', default: 1.0 }],
		glsl: 'return vec4(1.0);',
	};

	beforeEach(() => {
		transformRegistry.clear();
		// Create a fresh class for each test to avoid prototype pollution
		MockSynthSource = class implements SynthSourcePrototype {
			[key: string]: unknown;

			addTransform(name: string, userArgs: SynthParameterValue[]): unknown {
				return { name, args: userArgs, type: 'transform' };
			}
			addCombineTransform(
				name: string,
				source: unknown,
				userArgs: SynthParameterValue[]
			): unknown {
				return { name, source, args: userArgs, type: 'combine' };
			}
		};
		transformFactory.setSynthSourceClass(MockSynthSource);
	});

	afterEach(() => {
		transformRegistry.clear();
		vi.restoreAllMocks();
	});

	describe('setSynthSourceClass', () => {
		it('should store the class for later instantiation', () => {
			transformFactory.setSynthSourceClass(MockSynthSource);
			// We can verify this by checking if generateStandaloneFunctions works without error
			expect(() => transformFactory.generateStandaloneFunctions()).not.toThrow();
		});
	});

	describe('injectMethods', () => {
		it('should inject standard transform methods into prototype', () => {
			transformRegistry.register(mockTransform);
			const prototype = MockSynthSource.prototype;

			transformFactory.injectMethods(prototype);

			expect(prototype).toHaveProperty('mockEffect');
			const instance = new MockSynthSource();
			// @ts-expect-error - method is injected dynamically
			const result = instance.mockEffect(0.8);

			expect(result).toEqual({
				name: 'mockEffect',
				args: [0.8],
				type: 'transform',
			});
		});

		it('should inject combine transform methods into prototype', () => {
			transformRegistry.register(mockCombineTransform);
			const prototype = MockSynthSource.prototype;

			transformFactory.injectMethods(prototype);

			expect(prototype).toHaveProperty('mockCombine');
			const instance = new MockSynthSource();
			const source = new MockSynthSource();
			// @ts-expect-error - method is injected dynamically
			const result = instance.mockCombine(source, 0.2);

			expect(result).toEqual({
				name: 'mockCombine',
				source: source,
				args: [0.2],
				type: 'combine',
			});
		});

		it('should use default values for missing arguments', () => {
			transformRegistry.register(mockTransform);
			const prototype = MockSynthSource.prototype;
			transformFactory.injectMethods(prototype);

			const instance = new MockSynthSource();
			// @ts-expect-error - method is injected dynamically
			const result = instance.mockEffect(); // No args provided

			expect(result).toEqual({
				name: 'mockEffect',
				args: [0.5], // Default value
				type: 'transform',
			});
		});
	});

	describe('generateStandaloneFunctions', () => {
		it('should generate standalone functions for src type transforms', () => {
			transformRegistry.register(mockSrcTransform);
			// Class is already set in beforeEach

			const functions = transformFactory.generateStandaloneFunctions();

			expect(functions).toHaveProperty('mockSrc');
			expect(typeof functions.mockSrc).toBe('function');

			const result = functions.mockSrc(2.0);
			// It should create a new instance and call addTransform
			expect(result).toEqual({
				name: 'mockSrc',
				args: [2.0],
				type: 'transform',
			});
		});

		it('should not generate functions for non-src transforms', () => {
			transformRegistry.register(mockTransform); // color type

			const functions = transformFactory.generateStandaloneFunctions();

			expect(functions).not.toHaveProperty('mockEffect');
		});

		it('should throw if SynthSource class is not set', () => {
			// Temporarily unset the class
			(transformFactory as any)._synthSourceClass = null;

			expect(() => transformFactory.generateStandaloneFunctions()).toThrow(
				'[TransformFactory] SynthSource class not set'
			);
		});
	});

	describe('addTransform', () => {
		it('should register transform and inject method', () => {
			const newTransform: TransformDefinition = {
				name: 'dynamicTransform',
				type: 'color',
				inputs: [],
				glsl: 'return _c0;',
			};

			const prototype = MockSynthSource.prototype;
			transformFactory.addTransform(newTransform, prototype);

			expect(transformRegistry.has('dynamicTransform')).toBe(true);
			expect(prototype).toHaveProperty('dynamicTransform');
		});

		it('should generate standalone function if src type', () => {
			const newSrcTransform: TransformDefinition = {
				name: 'dynamicSrc',
				type: 'src',
				inputs: [],
				glsl: 'return vec4(1.0);',
			};

			transformFactory.addTransform(newSrcTransform);

			const functions = transformFactory.getGeneratedFunctions();
			expect(functions).toHaveProperty('dynamicSrc');
		});
	});
});
