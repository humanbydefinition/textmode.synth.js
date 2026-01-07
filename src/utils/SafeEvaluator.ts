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
 * Global error callback for all dynamic parameter errors.
 * Live coding environments can set this once to receive all error notifications.
 */
let globalErrorCallback: DynamicErrorCallback | null = null;

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
 * Helper to invoke the appropriate error callback.
 * Uses the provided callback, falling back to global callback.
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
    }
}

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
export function evaluateDynamic(
    fn: () => number | number[],
    uniformName: string,
    options: SafeEvalOptions = {}
): number | number[] {
    let result: number | number[];

    try {
        result = fn();
    } catch (error) {
        // Notify subscribers
        invokeErrorCallback(error, uniformName, options.onError);
        // Re-throw for environment to handle
        throw error;
    }

    // Validate the result
    if (!isValidValue(result)) {
        const invalidValueError = new Error(
            `[textmode.synth.js] Invalid dynamic parameter value for "${uniformName}": ${formatInvalidValue(result)}`
        );
        // Notify subscribers
        invokeErrorCallback(invalidValueError, uniformName, options.onError);
        // Throw for environment to handle
        throw invalidValueError;
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
 * Create a wrapped updater function that evaluates with error notification.
 *
 * @param updater - The original dynamic updater function
 * @param uniformName - Name of the uniform
 * @param onError - Optional error callback
 * @returns A wrapped function that notifies on errors and re-throws
 */
export function createDynamicUpdater(
    updater: (ctx: SynthContext) => number | number[],
    uniformName: string,
    onError?: DynamicErrorCallback
): (ctx: SynthContext) => number | number[] {
    return (ctx: SynthContext) => evaluateDynamic(() => updater(ctx), uniformName, { onError });
}
