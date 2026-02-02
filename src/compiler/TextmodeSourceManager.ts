/**
 * TextmodeSourceManager - Manages TextmodeSource references during shader compilation.
 *
 * Tracks which TextmodeSource instances (images/videos) are used in a shader
 * and generates appropriate uniform names for texture sampling.
 */

import type { TextmodeSourceReference } from '../core/types';
import type { CompilationTarget } from './types';

/**
 * Information about a TextmodeSource used in the shader.
 */
export interface TextmodeSourceInfo {
	/** Unique identifier for this source */
	sourceId: string;
	/** Uniform name for the sampler (e.g., 'u_tms0') */
	uniformName: string;
	/** Whether character context samples from this source */
	usesChar: boolean;
	/** Whether charColor/main context samples from this source */
	usesCharColor: boolean;
	/** Whether cellColor context samples from this source */
	usesCellColor: boolean;
	/** The actual TextmodeSource reference for render-time binding */
	sourceRef: TextmodeSourceReference;
	/** Width of source in grid cells */
	width: number;
	/** Height of source in grid cells */
	height: number;
}

/**
 * Manages TextmodeSource references during compilation.
 * Tracks usage and generates unique uniform names for each source.
 */
export class TextmodeSourceManager {
	private readonly _sources = new Map<string, TextmodeSourceInfo>();
	private _counter = 0;

	/**
	 * Reset all tracked sources for a fresh compilation.
	 */
	public reset(): void {
		this._sources.clear();
		this._counter = 0;
	}

	/**
	 * Track usage of a TextmodeSource in a specific compilation context.
	 *
	 * @param ref - The TextmodeSource reference
	 * @param target - The current compilation target (affects which channel is marked as used)
	 */
	public trackUsage(ref: TextmodeSourceReference, target: CompilationTarget): void {
		const source = typeof ref.source === 'function' ? ref.source() : ref.source;

		// If source is not yet available, we can't track dimensions or use it effectively.
		// However, we still need to track that it exists so we can generate a uniform.
		// We'll use default 0x0 dimensions if not available, assuming it will be available
		// by render time (or the user will see black/transparent).
		const width = source?.width ?? 0;
		const height = source?.height ?? 0;

		let info = this._sources.get(ref.sourceId);

		if (!info) {
			info = {
				sourceId: ref.sourceId,
				uniformName: `u_tms${this._counter++}`,
				usesChar: false,
				usesCharColor: false,
				usesCellColor: false,
				sourceRef: ref,
				width,
				height,
			};
			this._sources.set(ref.sourceId, info);
		} else {
			// Update dimensions in case they changed (re-compilation scenario)
			info.width = width;
			info.height = height;
		}

		// Track which channels are used based on compilation context
		switch (target) {
			case 'char':
				info.usesChar = true;
				break;
			case 'charColor':
			case 'main':
				info.usesCharColor = true;
				break;
			case 'cellColor':
				info.usesCellColor = true;
				break;
		}
	}

	/**
	 * Get all tracked TextmodeSource information.
	 */
	public getSources(): Map<string, TextmodeSourceInfo> {
		return this._sources;
	}

	/**
	 * Get the uniform name for a specific source.
	 */
	public getUniformName(sourceId: string): string {
		return this._sources.get(sourceId)?.uniformName ?? 'u_tms0';
	}

	/**
	 * Check if any TextmodeSource is being used.
	 */
	public hasAnySources(): boolean {
		return this._sources.size > 0;
	}
}
