import { describe, it, expect } from 'vitest';
import { SynthChain } from '../../src/core/SynthChain';
import type { TransformRecord } from '../../src/core/SynthChain';

describe('SynthChain', () => {
	const mockRecord1: TransformRecord = { name: 'test1', userArgs: [1] };
	const mockRecord2: TransformRecord = { name: 'test2', userArgs: [2, 3] };

	describe('static empty()', () => {
		it('should create an empty chain', () => {
			const chain = SynthChain.empty();
			expect(chain.length).toBe(0);
			expect(chain.transforms).toEqual([]);
		});
	});

	describe('static from()', () => {
		it('should create a chain from existing transforms', () => {
			const transforms = [mockRecord1, mockRecord2];
			const chain = SynthChain.from(transforms);

			expect(chain.length).toBe(2);
			expect(chain.transforms).toEqual(transforms);
			// Ensure deep copy or at least new array
			expect(chain.transforms).not.toBe(transforms);
		});
	});

	describe('transforms', () => {
		it('should return readonly view of transforms', () => {
			const chain = SynthChain.from([mockRecord1]);
			expect(chain.transforms).toEqual([mockRecord1]);
		});
	});

	describe('push()', () => {
		it('should mutate the chain by adding a record', () => {
			const chain = SynthChain.empty();
			chain.push(mockRecord1);

			expect(chain.length).toBe(1);
			expect(chain.transforms).toEqual([mockRecord1]);
		});
	});

	describe('length', () => {
		it('should report the number of transforms', () => {
			const chain = SynthChain.empty();
			expect(chain.length).toBe(0);

			chain.push(mockRecord1);
			expect(chain.length).toBe(1);
		});
	});
});
