/**
 * TextmodeSource guard helpers for sampler arguments.
 */

import type { UpdatableTextmodeSource } from '../core/types';

/**
 * Duck-type check for TextmodeSource instances (TextmodeImage / TextmodeVideo).
 * Mirrors the media sources accepted by `src(image)` / `src(video)`.
 */
export function isTextmodeSourceLike(value: unknown): value is UpdatableTextmodeSource {
	return (
		value !== null &&
		typeof value === 'object' &&
		'texture' in value &&
		'originalWidth' in value &&
		'originalHeight' in value
	);
}

/**
 * Generate a unique, stable-per-call source identifier.
 * Called once at chain construction so recompiles reuse the same id.
 */
export function generateSourceId(prefix = 'tms'): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
