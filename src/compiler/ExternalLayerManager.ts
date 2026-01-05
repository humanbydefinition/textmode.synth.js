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
export class ExternalLayerManager {
    /** Map from layer ID to external layer info */
    private readonly _externalLayers = new Map<string, ExternalLayerInfo>();

    /** Counter for generating unique uniform prefixes */
    private _counter = 0;

    /** Map from layer ID to uniform prefix for consistent naming */
    private readonly _layerIdToPrefix = new Map<string, string>();

    /**
     * Get or create a uniform prefix for an external layer.
     * 
     * @param layerId - Unique identifier for the layer
     * @returns The uniform prefix (e.g., 'extLayer0', 'extLayer1')
     */
    public getPrefix(layerId: string): string {
        let prefix = this._layerIdToPrefix.get(layerId);
        if (!prefix) {
            prefix = `extLayer${this._counter++}`;
            this._layerIdToPrefix.set(layerId, prefix);
        }
        return prefix;
    }

    /**
     * Track usage of an external layer's textures.
     * 
     * @param ref - The external layer reference
     * @param target - The current compilation target (determines which texture is sampled)
     */
    public trackUsage(ref: ExternalLayerReference, target: CompilationTarget): void {
        const prefix = this.getPrefix(ref.layerId);

        let info = this._externalLayers.get(ref.layerId);
        if (!info) {
            info = {
                layerId: ref.layerId,
                uniformPrefix: prefix,
                usesChar: false,
                usesCharColor: false,
                usesCellColor: false,
            };
            this._externalLayers.set(ref.layerId, info);
        }

        // Mark which texture is used based on compilation context
        switch (target) {
            case 'char':
                info.usesChar = true;
                break;
            case 'cellColor':
                info.usesCellColor = true;
                break;
            case 'charColor':
            case 'main':
            default:
                info.usesCharColor = true;
                break;
        }
    }

    /**
     * Check if a layer ID has been registered.
     */
    public hasLayer(layerId: string): boolean {
        return this._externalLayers.has(layerId);
    }

    /**
     * Get info for a specific external layer.
     */
    public getLayerInfo(layerId: string): ExternalLayerInfo | undefined {
        return this._externalLayers.get(layerId);
    }

    /**
     * Get all external layer references.
     * 
     * @returns A new Map containing all external layer info
     */
    public getExternalLayers(): Map<string, ExternalLayerInfo> {
        return new Map(this._externalLayers);
    }

    /**
     * Check if any external layers are referenced.
     */
    public get hasExternalLayers(): boolean {
        return this._externalLayers.size > 0;
    }

    /**
     * Get the count of external layers.
     */
    public get count(): number {
        return this._externalLayers.size;
    }

    /**
     * Reset all external layer tracking state.
     * Should be called at the start of each compilation.
     */
    public reset(): void {
        this._externalLayers.clear();
        this._counter = 0;
        this._layerIdToPrefix.clear();
    }
}
