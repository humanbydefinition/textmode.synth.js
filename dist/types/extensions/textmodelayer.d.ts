/**
 * TextmodeLayer extensions.
 *
 * Provides synth-related methods on TextmodeLayer instances:
 * - `synth()` - Apply a synth source to the layer
 * - `clearSynth()` - Remove synth from the layer
 * - `bpm()` - Set layer-specific BPM override
 *
 * @internal
 */
import type { TextmodePluginAPI } from 'textmode.js/plugins';
/**
 * Extend layer with synth() method.
 * @internal
 */
export declare function extendLayerSynth(api: TextmodePluginAPI): void;
/**
 * Extend layer with clearSynth() method.
 * @internal
 */
export declare function extendLayerClearSynth(api: TextmodePluginAPI): void;
/**
 * Extend layer with bpm() method.
 * @internal
 */
export declare function extendLayerBpm(api: TextmodePluginAPI): void;
//# sourceMappingURL=textmodelayer.d.ts.map