/**
 * TransformRegistry - Centralized registry for all synthesis transforms.
 *
 * This module provides a singleton registry for managing transform definitions.
 * Transforms can be registered at startup or dynamically added at runtime,
 * enabling extensibility through user-defined transforms.
 */
import type { TransformDefinition, ProcessedTransform } from './TransformDefinition';
import type { SynthTransformType } from '../core/types';
/**
 * Centralized registry for synthesis transforms.
 */
declare class TransformRegistry {
    /** Map of transform name to definition */
    private readonly _transforms;
    /** Cache of processed transforms */
    private readonly _processedCache;
    /**
     * Register a transform definition.
     */
    register(transform: TransformDefinition): void;
    /**
     * Register multiple transform definitions.
     */
    registerMany(transforms: TransformDefinition[]): void;
    /**
     * Get a transform definition by name.
     */
    get(name: string): TransformDefinition | undefined;
    /**
     * Get a processed transform by name (cached).
     */
    getProcessed(name: string): ProcessedTransform | undefined;
    /**
     * Check if a transform is registered.
     */
    has(name: string): boolean;
    /**
     * Get all transforms of a specific type.
     */
    getByType(type: SynthTransformType): TransformDefinition[];
    /**
     * Get all registered transform names.
     */
    getNames(): string[];
    /**
     * Get all registered transforms.
     */
    getAll(): TransformDefinition[];
    /**
     * Get source-type transforms (those that can start a chain).
     */
    getSourceTransforms(): TransformDefinition[];
    /**
     * Remove a transform from the registry.
     */
    remove(name: string): boolean;
    /**
     * Clear all transforms (mainly for testing).
     */
    clear(): void;
    /**
     * Get the count of registered transforms.
     */
    get size(): number;
}
/**
 * Singleton instance of the transform registry.
 */
export declare const transformRegistry: TransformRegistry;
export {};
//# sourceMappingURL=TransformRegistry.d.ts.map