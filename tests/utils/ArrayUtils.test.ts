import { describe, it, expect, beforeAll } from 'vitest';
import {
	initArrayUtils,
	getArrayValue,
	isModulatedArray,
	EASING_FUNCTIONS,
} from '../../src/utils/ArrayUtils';
import type { ModulatedArray } from '../../src/utils/ArrayUtils';
import type { SynthContext } from '../../src/core/types';

describe('ArrayUtils', () => {
	beforeAll(() => {
		initArrayUtils();
	});

	const mockContext: SynthContext = {
		time: 0,
		frameCount: 0,
		width: 100,
		height: 100,
		cols: 10,
		rows: 10,
		bpm: 60,
	};

	describe('initArrayUtils', () => {
		it('should add fast, smooth, ease, offset, fit methods to Array prototype', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			expect(typeof arr.fast).toBe('function');
			expect(typeof arr.smooth).toBe('function');
			expect(typeof arr.ease).toBe('function');
			expect(typeof arr.offset).toBe('function');
			expect(typeof arr.fit).toBe('function');
		});

		it('should make added methods non-enumerable', () => {
			const arr = [1, 2, 3];
			const keys = Object.keys(arr);
			expect(keys).not.toContain('fast');
			expect(keys).not.toContain('smooth');
			expect(keys).not.toContain('ease');
			expect(keys).not.toContain('offset');
			expect(keys).not.toContain('fit');
		});
	});

	describe('ModulatedArray methods', () => {
		it('fast() should set _speed', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			arr.fast(2);
			expect(arr._speed).toBe(2);
		});

		it('smooth() should set _smooth', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			arr.smooth(0.5);
			expect(arr._smooth).toBe(0.5);
		});

		it('ease() should set _ease and default _smooth to 1', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			arr.ease('linear');
			expect(arr._smooth).toBe(1);
			expect(arr._ease).toBe(EASING_FUNCTIONS.linear);
		});

		it('ease() should accept custom function', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			const customEase = (t: number) => t;
			arr.ease(customEase);
			expect(arr._ease).toBe(customEase);
		});

		it('offset() should set _offset', () => {
			const arr = [1, 2, 3] as ModulatedArray;
			arr.offset(0.25);
			expect(arr._offset).toBe(0.25);
		});

		it('fit() should remap values and preserve properties', () => {
			const arr = [0, 10] as ModulatedArray;
			arr.fast(2).smooth(0.5).offset(0.1);

			const fitted = arr.fit(0, 1);
			expect(fitted[0]).toBe(0);
			expect(fitted[1]).toBe(1);
			expect(fitted._speed).toBe(2);
			expect(fitted._smooth).toBe(0.5);
			expect(fitted._offset).toBe(0.1);
		});
	});

	describe('getArrayValue', () => {
		it('should return correct value for static array', () => {
			const arr = [10, 20] as ModulatedArray;
			// time 0 => index 0
			expect(getArrayValue(arr, { ...mockContext, time: 0 })).toBe(10);
			// time 0.5 (at 60bpm = 1 beat/sec) => 0.5 beat => index 0.5 => index 0
			expect(getArrayValue(arr, { ...mockContext, time: 0.5 })).toBe(10);
			// time 1.0 => index 1
			expect(getArrayValue(arr, { ...mockContext, time: 1.0 })).toBe(20);
		});

		it('should handle speed', () => {
			const arr = [10, 20] as ModulatedArray;
			arr.fast(2); // double speed
			// time 0.5 * 2 = 1.0 => index 1
			expect(getArrayValue(arr, { ...mockContext, time: 0.5 })).toBe(20);
		});

		it('should handle offset', () => {
			const arr = [10, 20] as ModulatedArray;
			arr.offset(0.5);
			// time 0 + 0.5 = 0.5 => index 0
			expect(getArrayValue(arr, { ...mockContext, time: 0 })).toBe(10);
			// time 0.5 + 0.5 = 1.0 => index 1
			expect(getArrayValue(arr, { ...mockContext, time: 0.5 })).toBe(20);
		});

		it('should handle smoothing (linear)', () => {
			const arr = [0, 10] as ModulatedArray;
			arr.smooth(1); // Linear interpolation across full step
			// With smooth=1, transition from index 0 to 1 happens from 0.5 to 1.5
			// So at index 1.0, we should be halfway (t=0.5)
			expect(getArrayValue(arr, { ...mockContext, time: 1.0 })).toBeCloseTo(5);
		});

        it('should handle smoothing wrapping around', () => {
            const arr = [0, 10] as ModulatedArray;
            arr.smooth(1);
            // array length 2.
            // Transition from index 1 (10) to index 0 (0) happens from 1.5 to 2.5
            // So at index 2.0, we should be halfway (t=0.5)
            expect(getArrayValue(arr, { ...mockContext, time: 2.0 })).toBeCloseTo(5);
        });

		it('should handle easing', () => {
			const arr = [0, 1] as ModulatedArray;
			// easeInQuad: t^2.
			// at t=0.5, value should be 0.25
			// As established, index 1.0 corresponds to t=0.5 when smooth=1
			arr.ease('easeInQuad');

			expect(getArrayValue(arr, { ...mockContext, time: 1.0 })).toBeCloseTo(0.25);
		});

		it('should use context BPM', () => {
			const arr = [0, 10] as ModulatedArray;
			// 120 BPM => 2 beats per second.
			// time 0.5s * 2 = 1.0 beat => index 1
			expect(getArrayValue(arr, { ...mockContext, bpm: 120, time: 0.5 })).toBe(10);
		});
	});

	describe('isModulatedArray', () => {
		it('should return true for number arrays', () => {
			expect(isModulatedArray([1, 2, 3])).toBe(true);
		});

		it('should return false for empty arrays', () => {
			expect(isModulatedArray([])).toBe(false);
		});

		it('should return false for string arrays', () => {
			expect(isModulatedArray(['a', 'b'])).toBe(false);
		});

		it('should return false for non-arrays', () => {
			expect(isModulatedArray(123)).toBe(false);
			expect(isModulatedArray({ a: 1 })).toBe(false);
			expect(isModulatedArray(null)).toBe(false);
		});
	});
});
