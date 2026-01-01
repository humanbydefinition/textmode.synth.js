import type { TextmodePlugin } from 'textmode.js';
/**
 * The `textmode.synth.js` plugin to install.
 *
 * Install this plugin to enable `.synth()` on TextmodeLayer instances.
 *
 * @example
 * ```typescript
 * import { textmode } from 'textmode.js';
 * import { SynthPlugin, noise, osc } from 'textmode.synth.js';
 *
 * const t = textmode.create({ plugins: [SynthPlugin] });
 *
 * t.layers.base.synth(
 *   noise(10)
 *     .charMap('@#%*+=-:. ')
 *     .charColor(osc(5).kaleid(4))
 * );
 * ```
 */
export declare const SynthPlugin: TextmodePlugin;
//# sourceMappingURL=SynthPlugin.d.ts.map