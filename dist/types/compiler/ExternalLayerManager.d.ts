import type { ExternalLayerInfo, CompilationTarget } from './types';
import type { ExternalLayerReference } from '../core/types';
/**
 * Manages external layer references and uniform prefix generation.
 *
 * When a synth chain references another layer via `src(layer)`, this manager:
 * 1. Generates unique uniform prefixes for the external layer's textures
 * 2. Tracks which textures (char, primary, cellColor) are actually sampled
 * 3. Provides mapping from layer IDs to uniform prefixes for code generation
 */
export declare class ExternalLayerManager {
    /** Map from layer ID to external layer info */
    private readonly _externalLayers;
    /** Counter for generating unique uniform prefixes */
    private _counter;
    /** Map from layer ID to uniform prefix for consistent naming */
    private readonly _layerIdToPrefix;
    /**
     * Get or create a uniform prefix for an external layer.
     *
     * @param layerId - Unique identifier for the layer
     * @returns The uniform prefix (e.g., 'extLayer0', 'extLayer1')
     */
    getPrefix(layerId: string): string;
    /**
     * Track usage of an external layer's textures.
     *
     * @param ref - The external layer reference
     * @param target - The current compilation target (determines which texture is sampled)
     */
    trackUsage(ref: ExternalLayerReference, target: CompilationTarget): void;
    /**
     * Check if a layer ID has been registered.
     */
    hasLayer(layerId: string): boolean;
    /**
     * Get info for a specific external layer.
     */
    getLayerInfo(layerId: string): ExternalLayerInfo | undefined;
    /**
     * Get all external layer references.
     *
     * @returns A new Map containing all external layer info
     */
    getExternalLayers(): Map<string, ExternalLayerInfo>;
    /**
     * Check if any external layers are referenced.
     */
    get hasExternalLayers(): boolean;
    /**
     * Get the count of external layers.
     */
    get count(): number;
    /**
     * Reset all external layer tracking state.
     * Should be called at the start of each compilation.
     */
    reset(): void;
}
//# sourceMappingURL=ExternalLayerManager.d.ts.map