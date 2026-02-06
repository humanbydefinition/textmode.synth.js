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
 * ```ts
 * setGlobalErrorCallback((error, uniformName) => {
 *   console.error(`[Synth] Parameter "${uniformName}" error:`, error);
 * });
 *
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * t.layers.base.synth(
 *   osc(8, 0.1, 1.2)
 *     .modulate(noise((ctx) => 1 + Math.sin(ctx.time) * 0.5), 0.2)
 * );
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
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
	fallback: number | number[]
): (ctx: SynthContext) => number | number[] {
	return (ctx: SynthContext) => {
		let result: number | number[];
		try {
			result = updater(ctx);
		} catch (error) {
			invokeErrorCallback(error, uniformName, ctx.onError);
			return fallback;
		}

		if (!isValidValue(result)) {
			const invalidValueError = new Error(
				`[textmode.synth.js] Invalid dynamic parameter value for "${uniformName}": ${formatInvalidValue(
					result
				)}`
			);
			invokeErrorCallback(invalidValueError, uniformName, ctx.onError);
			return fallback;
		}
		return result;
	};
}
