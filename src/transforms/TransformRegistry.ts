/**
 * TransformRegistry - Centralized registry for all synthesis transforms.
 * 
 * This module provides a singleton registry for managing transform definitions.
 * Transforms can be registered at startup or dynamically added at runtime,
 * enabling extensibility through user-defined transforms.
 */

import type { TransformDefinition, ProcessedTransform } from './TransformDefinition';
import { processTransform } from './TransformDefinition';
import type { SynthTransformType } from '../core/types';

/**
 * Centralized registry for synthesis transforms.
 */
class TransformRegistry {
	/** Map of transform name to definition */
	private readonly _transforms = new Map<string, TransformDefinition>();
	
	/** Cache of processed transforms */
	private readonly _processedCache = new Map<string, ProcessedTransform>();

	/**
	 * Register a transform definition.
	 */
	public register(transform: TransformDefinition): void {
		if (this._transforms.has(transform.name)) {
			console.warn(`[TransformRegistry] Overwriting existing transform: ${transform.name}`);
		}
		this._transforms.set(transform.name, transform);
		// Invalidate processed cache
		this._processedCache.delete(transform.name);
	}

	/**
	 * Register multiple transform definitions.
	 */
	public registerMany(transforms: TransformDefinition[]): void {
		for (const transform of transforms) {
			this.register(transform);
		}
	}

	/**
	 * Get a transform definition by name.
	 */
	public get(name: string): TransformDefinition | undefined {
		return this._transforms.get(name);
	}

	/**
	 * Get a processed transform by name (cached).
	 */
	public getProcessed(name: string): ProcessedTransform | undefined {
		let processed = this._processedCache.get(name);
		if (!processed) {
			const def = this._transforms.get(name);
			if (def) {
				processed = processTransform(def);
				this._processedCache.set(name, processed);
			}
		}
		return processed;
	}

	/**
	 * Check if a transform is registered.
	 */
	public has(name: string): boolean {
		return this._transforms.has(name);
	}

	/**
	 * Get all transforms of a specific type.
	 */
	public getByType(type: SynthTransformType): TransformDefinition[] {
		return Array.from(this._transforms.values()).filter((t) => t.type === type);
	}

	/**
	 * Get all registered transform names.
	 */
	public getNames(): string[] {
		return Array.from(this._transforms.keys());
	}

	/**
	 * Get all registered transforms.
	 */
	public getAll(): TransformDefinition[] {
		return Array.from(this._transforms.values());
	}

	/**
	 * Get source-type transforms (those that can start a chain).
	 */
	public getSourceTransforms(): TransformDefinition[] {
		return this.getByType('src');
	}

	/**
	 * Remove a transform from the registry.
	 */
	public remove(name: string): boolean {
		this._processedCache.delete(name);
		return this._transforms.delete(name);
	}

	/**
	 * Clear all transforms (mainly for testing).
	 */
	public clear(): void {
		this._transforms.clear();
		this._processedCache.clear();
	}

	/**
	 * Get the count of registered transforms.
	 */
	public get size(): number {
		return this._transforms.size;
	}
}

/**
 * Singleton instance of the transform registry.
 */
export const transformRegistry = new TransformRegistry();
