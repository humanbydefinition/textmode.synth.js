/**
 * ArrayUtils - Hydra-style array modulation utilities.
 * 
 * Provides methods for arrays to modulate values over time,
 * similar to Hydra's array functionality.
 */

import type { SynthContext } from '../core/types';

/**
 * Easing functions from https://gist.github.com/gre/1650294
 */
export const EASING_FUNCTIONS = {
	linear: (t: number) => t,
	easeInQuad: (t: number) => t * t,
	easeOutQuad: (t: number) => t * (2 - t),
	easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	easeInCubic: (t: number) => t * t * t,
	easeOutCubic: (t: number) => (--t) * t * t + 1,
	easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInQuart: (t: number) => t * t * t * t,
	easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
	easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
	easeInQuint: (t: number) => t * t * t * t * t,
	easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
	easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
	sin: (t: number) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2,
};

/**
 * Easing functions from https://gist.github.com/gre/1650294
 * 
 * Available easing functions: `'linear'`, `'easeInQuad'`, `'easeOutQuad'`, `'easeInOutQuad'`,
 * `'easeInCubic'`, `'easeOutCubic'`, `'easeInOutCubic'`, `'easeInQuart'`, `'easeOutQuart'`,
 * `'easeInOutQuart'`, `'easeInQuint'`, `'easeOutQuint'`, `'easeInOutQuint'`, `'sin'`
 * 
 * @example
 * ```typescript
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   plugins: [SynthPlugin]
 * });
 * 
 * // Rotating shape with eased animation
 * t.layers.base.synth(
 *   charShape(4)
 *     .rotate([-3.14, 3.14].ease('easeInOutCubic'))
 *     .charColor(
 *       shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic'))
 *     )
 *     .cellColor(
 *       shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic')).invert()
 *     )
 * );
 * ```
 */
export type EasingFunction = keyof typeof EASING_FUNCTIONS | ((t: number) => number);

/**
 * Extended array interface with modulation methods.
 */
export interface ModulatedArray extends Array<number> {
	/** Speed multiplier for array cycling */
	_speed?: number;
	/** Smoothing amount (0-1) for interpolation */
	_smooth?: number;
	/** Easing function for interpolation */
	_ease?: (t: number) => number;
	/** Time offset for array cycling */
	_offset?: number;

	/** Set speed multiplier */
	fast(speed: number): this;
	/** Set smoothing for interpolation */
	smooth(amount?: number): this;
	/** Set easing function */
	ease(ease: EasingFunction): this;
	/** Set time offset */
	offset(offset: number): this;
	/** Fit values to a new range */
	fit(low: number, high: number): ModulatedArray;
}

/**
 * Modulo operation (not remainder).
 */
function modulo(n: number, d: number): number {
	return ((n % d) + d) % d;
}

/**
 * Map a value from one range to another.
 */
function map(num: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
	return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Initialize array utilities by extending Array prototype.
 * This adds Hydra-style methods to arrays.
 */
export function initArrayUtils(): void {
	if ('fast' in Array.prototype) return; // Already initialized

	(Array.prototype as any).fast = function (this: ModulatedArray, speed = 1) {
		this._speed = speed;
		return this;
	};

	(Array.prototype as any).smooth = function (this: ModulatedArray, smooth = 1) {
		this._smooth = smooth;
		return this;
	};

	(Array.prototype as any).ease = function (this: ModulatedArray, ease: EasingFunction = 'linear') {
		if (typeof ease === 'function') {
			this._smooth = 1;
			this._ease = ease;
		} else if (EASING_FUNCTIONS[ease]) {
			this._smooth = 1;
			this._ease = EASING_FUNCTIONS[ease];
		}
		return this;
	};

	(Array.prototype as any).offset = function (this: ModulatedArray, offset = 0.5) {
		this._offset = offset % 1.0;
		return this;
	};

	(Array.prototype as any).fit = function (this: ModulatedArray, low = 0, high = 1): ModulatedArray {
		const lowest = Math.min(...this);
		const highest = Math.max(...this);
		const newArr = this.map((num) => map(num, lowest, highest, low, high)) as ModulatedArray;
		newArr._speed = this._speed;
		newArr._smooth = this._smooth;
		newArr._ease = this._ease;
		newArr._offset = this._offset;
		return newArr;
	};
}

/**
 * Get the current value from a modulated array based on context.
 */
export function getArrayValue(arr: ModulatedArray, ctx: SynthContext): number {
	const speed = arr._speed ?? 1;
	const smooth = arr._smooth ?? 0;
	const bpm = 60; // Default BPM, could be exposed as a setting
	// Offset is added directly to the time-based index (matching Hydra behavior)
	let index = ctx.time * speed * (bpm / 60) + (arr._offset ?? 0);

	if (smooth !== 0) {
		const ease = arr._ease ?? EASING_FUNCTIONS.linear;
		const _index = index - smooth / 2;

		// Get current and next values with proper wrapping using modulo (not remainder)
		const currValue = arr[Math.floor(modulo(_index, arr.length))];
		const nextValue = arr[Math.floor(modulo(_index + 1, arr.length))];

		// Calculate interpolation parameter
		const t = Math.min(modulo(_index, 1) / smooth, 1);

		// Apply easing and interpolate
		return ease(t) * (nextValue - currValue) + currValue;
	} else {
		// No smoothing - direct array access with proper modulo (not remainder)
		return arr[Math.floor(modulo(index, arr.length))];
	}
}

/**
 * Check if a value is a modulated array.
 * In Hydra, ALL number arrays are treated as time-varying sequences,
 * even without explicit .fast() or .smooth() modulation.
 */
export function isModulatedArray(value: unknown): value is ModulatedArray {
	return (
		Array.isArray(value) &&
		value.length > 0 &&
		typeof value[0] === 'number'
	);
}
