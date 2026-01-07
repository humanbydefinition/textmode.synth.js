/**
 * SafeEvaluator - Safe evaluation of dynamic parameters for live coding environments.
 *
 * This module provides defensive error handling around user-provided dynamic
 * parameter functions, preventing runtime errors from crashing the render loop.
 * Essential for live coding scenarios where users may introduce broken code.
 */
import type { SynthContext } from '../core/types';
/**
 * Error callback signature for dynamic parameter evaluation errors.
 *
 * Live coding environments can use this to:
 * - Log errors to their console
 * - Display visual error indicators
 * - Track which uniforms are failing
 *
 * @param error - The error that was caught
 * @param uniformName - Name of the uniform whose evaluation failed
 */
export type DynamicErrorCallback = (error: unknown, uniformName: string) => void;
/**
 * Options for safe dynamic parameter evaluation.
 */
export interface SafeEvalOptions {
    /** Fallback value to return when evaluation fails or returns non-finite */
    fallback: number | number[];
    /** Optional callback invoked when an error occurs (overrides global callback) */
    onError?: DynamicErrorCallback;
}
/**
 * Set a global error callback for all dynamic parameter evaluation errors.
 *
 * This provides a centralized way for live coding environments to receive
 * notifications whenever any dynamic parameter fails to evaluate.
 *
 * @param callback - The callback to invoke on errors, or null to disable
 *
 * @example
 * ```typescript
 * import { setGlobalErrorCallback } from 'textmode.synth.js';
 *
 * // Set up global error handling in your live coding environment
 * setGlobalErrorCallback((error, uniformName) => {
 *   console.error(`[Synth] Dynamic parameter "${uniformName}" error:`, error);
 *   // Display in editor console, show visual indicator, etc.
 * });
 *
 * // Later, to disable:
 * setGlobalErrorCallback(null);
 * ```
 */
export declare function setGlobalErrorCallback(callback: DynamicErrorCallback | null): void;
/**
 * Get the current global error callback.
 * Useful for temporarily replacing and then restoring the callback.
 */
export declare function getGlobalErrorCallback(): DynamicErrorCallback | null;
/**
 * Safely evaluate a dynamic parameter function.
 *
 * Wraps the evaluation in a try-catch to prevent errors from propagating
 * and crashing the render loop. Returns a safe fallback value on:
 * - Any thrown exception
 * - undefined result
 * - NaN result
 * - Infinite result
 *
 * Error callback is invoked for both exceptions AND invalid values.
 *
 * @param fn - The dynamic parameter function to evaluate
 * @param uniformName - Name of the uniform (for error reporting and caching)
 * @param options - Evaluation options including fallback and error callback
 * @returns The evaluated value, last good value, or fallback
 *
 * @example
 * ```typescript
 * const value = safeEvaluateDynamic(
 *   () => updater(synthContext),
 *   'u_freq',
 *   { fallback: 1.0, onError: console.error }
 * );
 * ```
 */
export declare function safeEvaluateDynamic(fn: () => number | number[], uniformName: string, options: SafeEvalOptions): number | number[];
/**
 * Clear the last known good values cache.
 * Useful when switching synth sources or recompiling.
 */
export declare function clearSafeEvalCache(): void;
/**
 * Create a wrapped updater function that safely evaluates the original.
 *
 * This is useful for pre-wrapping updaters during compilation so that
 * the render loop doesn't need to handle try-catch directly.
 *
 * @param updater - The original dynamic updater function
 * @param uniformName - Name of the uniform
 * @param fallback - Fallback value on error
 * @param onError - Optional error callback
 * @returns A wrapped function that will never throw
 */
export declare function createSafeUpdater(updater: (ctx: SynthContext) => number | number[], uniformName: string, fallback: number | number[], onError?: DynamicErrorCallback): (ctx: SynthContext) => number | number[];
//# sourceMappingURL=SafeEvaluator.d.ts.map