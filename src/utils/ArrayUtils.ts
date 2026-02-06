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
	easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
	easeInCubic: (t: number) => t * t * t,
	easeOutCubic: (t: number) => --t * t * t + 1,
	easeInOutCubic: (t: number) =>
		t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
	easeInQuart: (t: number) => t * t * t * t,
	easeOutQuart: (t: number) => 1 - --t * t * t * t,
	easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
	easeInQuint: (t: number) => t * t * t * t * t,
	easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
	easeInOutQuint: (t: number) =>
		t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
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
 * ```javascript
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * t.layers.base.synth(
 *   shape(4)
 *     .rotate([-1.5, 1.5].ease('easeInOutCubic'))
 * );
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 */
export type EasingFunction = keyof typeof EASING_FUNCTIONS | ((t: number) => number);

/**
 * Extended array interface with modulation methods.
 *
 * Arrays in textmode.synth.js behave like hydra - they cycle through values over time,
 * creating dynamic, time-varying parameters. This enables complex animations without
 * manually tracking time or state.
 *
 * @example
 * ```javascript
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * t.layers.base.synth(
 *   osc([4, 8, 12].fast(1.5), 0.1, 1.2)
 *     .kaleid(5)
 * );
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 */
export interface ModulatedArray extends Array<number> {
	/** Speed multiplier for array cycling @ignore */
	_speed?: number;
	/** Smoothing amount (0-1) for interpolation @ignore */
	_smooth?: number;
	/** Easing function for interpolation @ignore */
	_ease?: (t: number) => number;
	/** Time offset for array cycling @ignore */
	_offset?: number;

	/**
	 * Set speed multiplier for array cycling.
	 *
	 * Controls how fast the array cycles through its values over time.
	 * A speed of 1 is the default rate. Values > 1 cycle faster, values < 1 cycle slower.
	 *
	 * @param speed - Speed multiplier (default: 1)
	 * @returns The array for chaining
	 *
	 * @example
	 * ```javascript
	 * const t = textmode.create({
	 *   width: window.innerWidth,
	 *   height: window.innerHeight,
	 *   plugins: [SynthPlugin]
	 * });
	 *
	 * t.layers.base.synth(
	 *   osc([4, 8, 12].fast(2), 0.1, 1.2)
	 *     .kaleid(5)
	 * );
	 *
	 * t.windowResized(() => {
	 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
	 * });
	 * ```
	 */
	fast(speed: number): this;

	/**
	 * Enable smooth interpolation between array values.
	 *
	 * Instead of jumping from one value to the next, smooth() creates gradual
	 * transitions. The amount parameter controls the smoothing duration.
	 * When amount is 1 (default), smoothing is applied across the full transition.
	 *
	 * @param amount - Smoothing amount 0-1 (default: 1)
	 * @returns The array for chaining
	 *
	 * @example
	 * ```javascript
	 * const t = textmode.create({
	 *   width: window.innerWidth,
	 *   height: window.innerHeight,
	 *   plugins: [SynthPlugin]
	 * });
	 *
	 * t.layers.base.synth(
	 *   shape(5, 0.4)
	 *     .scale([0.6, 1.2].smooth(0.8))
	 * );
	 *
	 * t.windowResized(() => {
	 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
	 * });
	 * ```
	 */
	smooth(amount?: number): this;

	/**
	 * Apply easing function to interpolation between array values.
	 *
	 * Easing controls the acceleration curve of transitions between values.
	 * Automatically enables smoothing when applied. Use built-in easing names
	 * or provide a custom function that takes a value 0-1 and returns 0-1.
	 *
	 * Available easing functions: `'linear'`, `'easeInQuad'`, `'easeOutQuad'`,
	 * `'easeInOutQuad'`, `'easeInCubic'`, `'easeOutCubic'`, `'easeInOutCubic'`,
	 * `'easeInQuart'`, `'easeOutQuart'`, `'easeInOutQuart'`, `'easeInQuint'`,
	 * `'easeOutQuint'`, `'easeInOutQuint'`, `'sin'`
	 *
	 * @param ease - Easing function name or custom function (default: 'linear')
	 * @returns The array for chaining
	 *
	 * @example
	 * ```javascript
	 * const t = textmode.create({
	 *   width: window.innerWidth,
	 *   height: window.innerHeight,
	 *   plugins: [SynthPlugin]
	 * });
	 *
	 * t.layers.base.synth(
	 *   shape(4)
	 *     .rotate([-1.5, 1.5].ease('sin'))
	 * );
	 *
	 * t.windowResized(() => {
	 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
	 * });
	 * ```
	 */
	ease(ease: EasingFunction): this;

	/**
	 * Set time offset for array cycling.
	 *
	 * Shifts when the array starts cycling through its values.
	 * Useful for creating phase-shifted animations where multiple arrays
	 * cycle with the same speed but at different times.
	 *
	 * The offset wraps around at 1.0, so offset(0.5) starts halfway through
	 * the cycle, and offset(1.5) is equivalent to offset(0.5).
	 *
	 * @param offset - Time offset 0-1, wraps at 1.0 (default: 0)
	 * @returns The array for chaining
	 *
	 * @example
	 * ```javascript
	 * const t = textmode.create({
	 *   width: window.innerWidth,
	 *   height: window.innerHeight,
	 *   plugins: [SynthPlugin]
	 * });
	 *
	 * const base = [6, 12, 18].fast(1.5);
	 *
	 * t.layers.base.synth(
	 *   osc(base, 0.1, 1.2)
	 *     .layer(osc(base.offset(0.5), 0.1, 1.2), 0.5)
	 * );
	 *
	 * t.windowResized(() => {
	 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
	 * });
	 * ```
	 */
	offset(offset: number): this;

	/**
	 * Fit (remap) array values to a new range.
	 *
	 * Takes the minimum and maximum values in the array and linearly maps them
	 * to the specified low and high values. All intermediate values are scaled
	 * proportionally. The original array is not modified.
	 *
	 * Preserves any modulation settings (speed, smooth, ease, offset) from the
	 * original array.
	 *
	 * @param low - New minimum value
	 * @param high - New maximum value
	 * @returns A new ModulatedArray with remapped values
	 *
	 * @example
	 * ```javascript
	 * const t = textmode.create({
	 *   width: window.innerWidth,
	 *   height: window.innerHeight,
	 *   plugins: [SynthPlugin]
	 * });
	 *
	 * t.layers.base.synth(
	 *   shape(6)
	 *     .scale([2, 6].fit(0.5, 1.5))
	 * );
	 *
	 * t.windowResized(() => {
	 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
	 * });
	 * ```
	 */
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
	if (inMin === inMax) return (outMin + outMax) / 2;
	return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Initialize array utilities by extending Array prototype.
 * This adds Hydra-style methods to arrays.
 */
export function initArrayUtils(): void {
	if ('fast' in Array.prototype) return; // Already initialized

	// Define methods as non-enumerable to prevent pollution in for...in loops
	Object.defineProperty(Array.prototype, 'fast', {
		value: function (this: ModulatedArray, speed = 1) {
			this._speed = speed;
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});

	Object.defineProperty(Array.prototype, 'smooth', {
		value: function (this: ModulatedArray, smooth = 1) {
			this._smooth = smooth;
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});

	Object.defineProperty(Array.prototype, 'ease', {
		value: function (this: ModulatedArray, ease: EasingFunction = 'linear') {
			if (typeof ease === 'function') {
				this._smooth = 1;
				this._ease = ease;
			} else if (EASING_FUNCTIONS[ease]) {
				this._smooth = 1;
				this._ease = EASING_FUNCTIONS[ease];
			}
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});

	Object.defineProperty(Array.prototype, 'offset', {
		value: function (this: ModulatedArray, offset = 0.5) {
			this._offset = offset % 1.0;
			return this;
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});

	Object.defineProperty(Array.prototype, 'fit', {
		value: function (this: ModulatedArray, low = 0, high = 1): ModulatedArray {
			const lowest = Math.min(...this);
			const highest = Math.max(...this);
			const newArr = this.map((num) =>
				map(num, lowest, highest, low, high)
			) as ModulatedArray;
			newArr._speed = this._speed;
			newArr._smooth = this._smooth;
			newArr._ease = this._ease;
			newArr._offset = this._offset;
			return newArr;
		},
		writable: true,
		configurable: true,
		enumerable: false,
	});
}

/**
 * Get the current value from a modulated array based on context.
 */
export function getArrayValue(arr: ModulatedArray, ctx: SynthContext): number {
	const speed = arr._speed ?? 1;
	const smooth = arr._smooth ?? 0;
	// Use BPM from context (can be global or layer-specific)
	let index = ctx.time * speed * (ctx.bpm / 60) + (arr._offset ?? 0);

	if (smooth !== 0) {
		const ease = arr._ease ?? EASING_FUNCTIONS.linear;
		const _index = index - smooth / 2;
		const indexFloor = Math.floor(_index);

		// Get current and next values with proper wrapping using modulo (not remainder)
		const currIndex = modulo(indexFloor, arr.length);
		// Since currIndex is guaranteed to be positive 0..len-1, we can use simple %
		const nextIndex = (currIndex + 1) % arr.length;

		const currValue = arr[currIndex];
		const nextValue = arr[nextIndex];

		// Calculate interpolation parameter
		// modulo(_index, 1) is equivalent to _index - indexFloor
		const t = Math.min((_index - indexFloor) / smooth, 1);

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
	return Array.isArray(value) && value.length > 0 && typeof value[0] === 'number';
}
