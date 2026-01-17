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
 * Global error callback for all dynamic parameter errors.
 */
let globalErrorCallback: DynamicErrorCallback | null = null;

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
export function setGlobalErrorCallback(callback: DynamicErrorCallback | null): void {
	globalErrorCallback = callback;
}

/**
 * Get the current global error callback.
 */
export function getGlobalErrorCallback(): DynamicErrorCallback | null {
	return globalErrorCallback;
}

/**
 * Invoke the appropriate error callback.
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
			// Ignore errors in the callback itself
		}
	}
}

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
export function evaluateDynamic(
	fn: () => number | number[],
	uniformName: string,
	fallback: number | number[],
	options: EvalOptions = {}
): number | number[] {
	let result: number | number[];

	try {
		result = fn();
	} catch (error) {
		invokeErrorCallback(error, uniformName, options.onError);
		return fallback;
	}

	if (!isValidValue(result)) {
		const invalidValueError = new Error(
			`[textmode.synth.js] Invalid dynamic parameter value for "${uniformName}": ${formatInvalidValue(result)}`
		);
		invokeErrorCallback(invalidValueError, uniformName, options.onError);
		return fallback;
	}

	return result;
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
 * Create a wrapped updater function with graceful error handling.
 */
export function createDynamicUpdater(
	updater: (ctx: SynthContext) => number | number[],
	uniformName: string,
	fallback: number | number[],
	onError?: DynamicErrorCallback
): (ctx: SynthContext) => number | number[] {
	return (ctx: SynthContext) =>
		evaluateDynamic(() => updater(ctx), uniformName, fallback, { onError });
}
