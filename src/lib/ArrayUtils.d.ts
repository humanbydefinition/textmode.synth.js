/**
 * Type augmentation for Array.prototype methods added by ArrayUtils.
 * This enables TypeScript to recognize Hydra-style array methods.
 */

import type { ModulatedArray, EasingFunction } from './ArrayUtils';

declare global {
	interface Array<T> {
		/**
		 * Set speed multiplier for array cycling.
		 * @param speed Speed multiplier (default: 1)
		 */
		fast(speed: number): this extends number[] ? ModulatedArray : this;

		/**
		 * Set smoothing for interpolation between array values.
		 * @param amount Smoothing amount 0-1 (default: 1)
		 */
		smooth(amount?: number): this extends number[] ? ModulatedArray : this;

		/**
		 * Set easing function for interpolation.
		 * @param ease Easing function name or custom function (default: 'linear')
		 */
		ease(ease: EasingFunction): this extends number[] ? ModulatedArray : this;

		/**
		 * Set time offset for array cycling.
		 * @param offset Time offset 0-1 (default: 0.5)
		 */
		offset(offset: number): this extends number[] ? ModulatedArray : this;

		/**
		 * Fit array values to a new range.
		 * @param low New minimum value (default: 0)
		 * @param high New maximum value (default: 1)
		 */
		fit(low?: number, high?: number): this extends number[] ? ModulatedArray : this;
	}
}
