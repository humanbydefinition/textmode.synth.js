/**
 * Type augmentation for Array.prototype methods added by ArrayUtils.
 * This enables TypeScript to recognize Hydra-style array methods.
 */

import type { EasingFunction, ModulatedArray } from './ArrayUtils';

declare global {
	interface Array<T> {
		/** Set the speed multiplier for array cycling. */
		fast(speed: number): T extends number ? ModulatedArray : this;

		/** Set smoothing for interpolation between array values. */
		smooth(amount?: number): T extends number ? ModulatedArray : this;

		/** Set the easing function used for interpolation. */
		ease(ease: EasingFunction): T extends number ? ModulatedArray : this;

		/** Set the time offset for array cycling. */
		offset(offset: number): T extends number ? ModulatedArray : this;

		/** Fit array values to a new range. */
		fit(low?: number, high?: number): T extends number ? ModulatedArray : this;
	}
}
