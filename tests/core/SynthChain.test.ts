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
            expect(chain.isEmpty).toBe(true);
            expect(chain.transforms).toEqual([]);
        });
    });

    describe('static from()', () => {
        it('should create a chain from existing transforms', () => {
            const transforms = [mockRecord1, mockRecord2];
            const chain = SynthChain.from(transforms);

            expect(chain.length).toBe(2);
            expect(chain.isEmpty).toBe(false);
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
            expect(chain.get(0)).toEqual(mockRecord1);
        });
    });

    describe('length & isEmpty', () => {
        it('should report correct length and empty status', () => {
            const chain = SynthChain.empty();
            expect(chain.length).toBe(0);
            expect(chain.isEmpty).toBe(true);

            chain.push(mockRecord1);
            expect(chain.length).toBe(1);
            expect(chain.isEmpty).toBe(false);
        });
    });

    describe('append()', () => {
        it('should return a new chain with appended record (immutability)', () => {
            const chain1 = SynthChain.from([mockRecord1]);
            const chain2 = chain1.append(mockRecord2);

            // chain1 should be unchanged
            expect(chain1.length).toBe(1);
            expect(chain1.transforms).toEqual([mockRecord1]);

            // chain2 should have both
            expect(chain2.length).toBe(2);
            expect(chain2.transforms).toEqual([mockRecord1, mockRecord2]);
            expect(chain2).not.toBe(chain1);
        });
    });

    describe('get()', () => {
        it('should return record at index', () => {
            const chain = SynthChain.from([mockRecord1, mockRecord2]);
            expect(chain.get(0)).toEqual(mockRecord1);
            expect(chain.get(1)).toEqual(mockRecord2);
        });

        it('should return undefined for out of bounds', () => {
            const chain = SynthChain.from([mockRecord1]);
            expect(chain.get(99)).toBeUndefined();
        });
    });

    describe('iterator', () => {
        it('should be iterable', () => {
            const chain = SynthChain.from([mockRecord1, mockRecord2]);
            const result = [...chain];
            expect(result).toEqual([mockRecord1, mockRecord2]);
        });
    });
});
