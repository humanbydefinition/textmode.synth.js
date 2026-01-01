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
export declare const EASING_FUNCTIONS: {
    linear: (t: number) => number;
    easeInQuad: (t: number) => number;
    easeOutQuad: (t: number) => number;
    easeInOutQuad: (t: number) => number;
    easeInCubic: (t: number) => number;
    easeOutCubic: (t: number) => number;
    easeInOutCubic: (t: number) => number;
    easeInQuart: (t: number) => number;
    easeOutQuart: (t: number) => number;
    easeInOutQuart: (t: number) => number;
    easeInQuint: (t: number) => number;
    easeOutQuint: (t: number) => number;
    easeInOutQuint: (t: number) => number;
    sin: (t: number) => number;
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
 * Initialize array utilities by extending Array prototype.
 * This adds Hydra-style methods to arrays.
 */
export declare function initArrayUtils(): void;
/**
 * Get the current value from a modulated array based on context.
 */
export declare function getArrayValue(arr: ModulatedArray, ctx: SynthContext): number;
/**
 * Check if a value is a modulated array.
 * In Hydra, ALL number arrays are treated as time-varying sequences,
 * even without explicit .fast() or .smooth() modulation.
 */
export declare function isModulatedArray(value: unknown): value is ModulatedArray;
//# sourceMappingURL=ArrayUtils.d.ts.map