/**
 * SafeEvaluator - Dynamic parameter evaluation with error notification for live coding environments.
 *
 * This module provides error handling around user-provided dynamic parameter functions.
 * Errors are caught, reported to subscribers via callback, and then re-thrown so that
 * live coding environments can detect them and handle recovery at the sketch level.
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
 * Options for dynamic parameter evaluation.
 */
export interface SafeEvalOptions {
    /** Optional callback invoked when an error occurs (overrides global callback) */
    onError?: DynamicErrorCallback;
}
/**
 * Set a global error callback for all dynamic parameter evaluation errors.
 *
 * This provides a centralized way for live coding environments to receive
 * notifications whenever any dynamic parameter fails to evaluate.
 * After the callback is invoked, the error is re-thrown so environments
 * can handle recovery at the sketch level.
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
 * Evaluate a dynamic parameter function with error notification.
 *
 * Validates the result and notifies subscribers of any errors via callback.
 * Errors are then re-thrown so live coding environments can detect them
 * and handle recovery at the sketch level.
 *
 * Throws on:
 * - Any exception from the function
 * - undefined result
 * - NaN result
 * - Infinite result
 *
 * @param fn - The dynamic parameter function to evaluate
 * @param uniformName - Name of the uniform (for error reporting)
 * @param options - Evaluation options including error callback
 * @returns The evaluated value
 * @throws Error if the function throws or returns an invalid value
 *
 * @example
 * ```typescript
 * const value = evaluateDynamic(
 *   () => updater(synthContext),
 *   'u_freq',
 *   { onError: console.error }
 * );
 * ```
 */
export declare function evaluateDynamic(fn: () => number | number[], uniformName: string, options?: SafeEvalOptions): number | number[];
/**
 * Create a wrapped updater function that evaluates with error notification.
 *
 * @param updater - The original dynamic updater function
 * @param uniformName - Name of the uniform
 * @param onError - Optional error callback
 * @returns A wrapped function that notifies on errors and re-throws
 */
export declare function createDynamicUpdater(updater: (ctx: SynthContext) => number | number[], uniformName: string, onError?: DynamicErrorCallback): (ctx: SynthContext) => number | number[];
//# sourceMappingURL=SafeEvaluator.d.ts.map