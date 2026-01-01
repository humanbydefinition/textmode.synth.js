/**
 * SynthPlugin - The textmode.js plugin that enables synth functionality on layers.
 *
 * This plugin adds the `.synth()`, `.clearSynth()`, and `.hasSynth()` methods
 * to TextmodeLayer instances, enabling hydra-like procedural generation.
 */
import type { TextmodePlugin } from 'textmode.js';
/**
 * The `textmode.synth.js` plugin to install.
 *
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, charNoise, osc } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * const layer = t.layers.add();
 *
 * // Can be called globally, before setup()
 * layer.synth(
 *   charNoise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5).kaleid(4))
 * );
 * ```
 */
export declare const SynthPlugin: TextmodePlugin;
//# sourceMappingURL=SynthPlugin.d.ts.map