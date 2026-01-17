/**
 * DynamicEvaluator - Dynamic parameter evaluation for live coding environments.
 *
 * Provides graceful error handling for user-provided dynamic parameter functions.
 * When evaluation fails, errors are reported via callback and a fallback value
 * is returned, allowing rendering to continue with safe defaults.
 */
import type { SynthContext } from '../core/types';
/**
 * Callback signature for dynamic parameter evaluation errors.
 * Live coding environments can use this to display errors without interrupting rendering.
 */
export type DynamicErrorCallback = (error: unknown, uniformName: string) => void;
/**
 * Options for dynamic parameter evaluation.
 */
export interface EvalOptions {
    /** Callback invoked when an error occurs (overrides global callback) */
    onError?: DynamicErrorCallback;
}
/**
 * Set a global error callback for dynamic parameter evaluation errors.
 *
 * Provides a centralized way for live coding environments to receive
 * notifications whenever a dynamic parameter fails to evaluate.
 *
 * @example
 * ```typescript
 * import { setGlobalErrorCallback } from 'textmode.synth.js';
 *
 * setGlobalErrorCallback((error, uniformName) => {
 *   console.error(`[Synth] Parameter "${uniformName}" error:`, error);
 * });
 * ```
 */
export declare function setGlobalErrorCallback(callback: DynamicErrorCallback | null): void;
/**
 * Get the current global error callback.
 */
export declare function getGlobalErrorCallback(): DynamicErrorCallback | null;
/**
 * Evaluate a dynamic parameter with graceful error handling.
 *
 * When evaluation fails (exception or invalid value), the error is reported
 * via callback and the fallback value is returned. This allows rendering to
 * continue with safe defaults rather than aborting the frame.
 *
 * @param fn - The dynamic parameter function to evaluate
 * @param uniformName - Name of the uniform (for error reporting)
 * @param fallback - Value to return if evaluation fails
 * @param options - Evaluation options including error callback
 * @returns The evaluated value, or fallback on error
 */
export declare function evaluateDynamic(fn: () => number | number[], uniformName: string, fallback: number | number[], options?: EvalOptions): number | number[];
/**
 * Create a wrapped updater function with graceful error handling.
 */
export declare function createDynamicUpdater(updater: (ctx: SynthContext) => number | number[], uniformName: string, fallback: number | number[], onError?: DynamicErrorCallback): (ctx: SynthContext) => number | number[];
/**
 * Create an optimized wrapped updater function that avoids closure allocation per frame.
 *
 * This version should be used at compilation time to wrap updaters. It expects
 * the error callback to be available on the SynthContext (or falls back to global).
 */
export declare function createOptimizedDynamicUpdater(updater: (ctx: SynthContext) => number | number[], uniformName: string, fallback: number | number[]): (ctx: SynthContext) => number | number[];
//# sourceMappingURL=SafeEvaluator.d.ts.map