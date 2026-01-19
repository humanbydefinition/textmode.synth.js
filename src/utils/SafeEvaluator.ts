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
 * Global error callback for all dynamic parameter errors.
 * Live coding environments can set this once to receive all error notifications.
 */
let globalErrorCallback: DynamicErrorCallback | null = null;

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
export function setGlobalErrorCallback(callback: DynamicErrorCallback | null): void {
	globalErrorCallback = callback;
}

/**
 * Get the current global error callback.
 * Useful for temporarily replacing and then restoring the callback.
 */
export function getGlobalErrorCallback(): DynamicErrorCallback | null {
	return globalErrorCallback;
}

/**
 * Cache for storing last known good values per uniform.
 * This allows recovery to the most recent successful value rather than
 * always falling back to the initial default.
 */
const lastGoodValues = new Map<string, number | number[]>();

/**
 * Throttle tracking to avoid flooding the console with repeated errors.
 * Maps uniform name to last error time.
 */
const errorThrottle = new Map<string, number>();
const ERROR_THROTTLE_MS = 1000; // Only log same error once per second

/**
 * Helper to invoke the appropriate error callback.
 * Uses the provided callback, falling back to global callback,
 * and finally falling back to console.warn for beginner-friendliness.
 */
function invokeErrorCallback(
	error: unknown,
	uniformName: string,
	localCallback?: DynamicErrorCallback
): void {
	const callback = localCallback ?? globalErrorCallback;

	if (callback) {
		try {
			callback(error, uniformName);
		} catch {
			// Ignore errors in the error callback itself
		}
	} else {
		// Default behavior: log to console with throttling for beginner-friendliness
		// This ensures users always get feedback about bad dynamic parameters
		const now = Date.now();
		const lastErrorTime = errorThrottle.get(uniformName) ?? 0;

		if (now - lastErrorTime >= ERROR_THROTTLE_MS) {
			errorThrottle.set(uniformName, now);

			const errorMessage = error instanceof Error ? error.message : String(error);
			console.warn(
				`[textmode.synth.js] Dynamic parameter error in "${uniformName}": ${errorMessage}`
			);
		}
	}
}

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
export function safeEvaluateDynamic(
	fn: () => number | number[],
	uniformName: string,
	options: SafeEvalOptions
): number | number[] {
	try {
		const result = fn();

		// Validate the result
		if (!isValidValue(result)) {
			// Result is undefined, NaN, Infinity, or otherwise invalid
			// Report this as an error so the user gets feedback
			const invalidValueError = new Error(
				`Invalid dynamic parameter value: ${formatInvalidValue(result)}`
			);
			invokeErrorCallback(invalidValueError, uniformName, options.onError);

			// Try to return last good value, otherwise use fallback
			const lastGood = lastGoodValues.get(uniformName);
			if (lastGood !== undefined) {
				return lastGood;
			}
			return options.fallback;
		}

		// Cache this as the last known good value
		lastGoodValues.set(uniformName, result);
		return result;
	} catch (error) {
		// Invoke error callback for exception
		invokeErrorCallback(error, uniformName, options.onError);

		// Try to return last good value, otherwise use fallback
		const lastGood = lastGoodValues.get(uniformName);
		if (lastGood !== undefined) {
			return lastGood;
		}
		return options.fallback;
	}
}

/**
 * Format an invalid value for error messaging.
 */
function formatInvalidValue(value: unknown): string {
	if (value === undefined) return 'undefined';
	if (value === null) return 'null';
	if (typeof value === 'number') {
		if (Number.isNaN(value)) return 'NaN';
		if (!Number.isFinite(value)) return value > 0 ? 'Infinity' : '-Infinity';
	}
	if (Array.isArray(value)) {
		const invalidIndex = value.findIndex((v) => typeof v !== 'number' || !Number.isFinite(v));
		if (invalidIndex >= 0) {
			return `array with invalid element at index ${invalidIndex}: ${formatInvalidValue(value[invalidIndex])}`;
		}
	}
	return String(value);
}

/**
 * Check if a value is valid for use as a uniform.
 * Rejects undefined, null, NaN, and Infinity values which would cause issues.
 */
function isValidValue(value: unknown): value is number | number[] {
	if (value === undefined || value === null) {
		return false;
	}

	if (typeof value === 'number') {
		return Number.isFinite(value);
	}

	if (Array.isArray(value)) {
		return value.length > 0 && value.every((v) => typeof v === 'number' && Number.isFinite(v));
	}

	return false;
}

/**
 * Clear the last known good values cache.
 * Useful when switching synth sources or recompiling.
 */
export function clearSafeEvalCache(): void {
	lastGoodValues.clear();
}

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
export function createSafeUpdater(
	updater: (ctx: SynthContext) => number | number[],
	uniformName: string,
	fallback: number | number[],
	onError?: DynamicErrorCallback
): (ctx: SynthContext) => number | number[] {
	return (ctx: SynthContext) =>
		safeEvaluateDynamic(() => updater(ctx), uniformName, { fallback, onError });
}
