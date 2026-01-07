/**
 *
 * A derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/ojack),
 * adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem, providing
 * a visual synthesis system for procedural generation of characters, colors,
 * and visual effects through method chaining.
 *
 * @example
 * ```ts
 * // Create textmode instance with SynthPlugin
 * const t = textmode.create({
 *   width: 800,
 *   height: 600,
 *   fontSize: 16,
 *   plugins: [SynthPlugin]
 * });
 *
 * // Create a synth chain with procedural characters and colors
 * const synth = noise(10)
 *   .rotate(0.1)
 *   .scroll(0.1, 0)
 *
 *   .charColor(osc(5).kaleid(4))
 *   .cellColor(osc(5).kaleid(4).invert())
 *
 *   .charMap('@#%*+=-:. ');
 *
 *
 * // Apply synth to the base layer
 * t.layers.base.synth(synth);
 * ```
 *
 * @packageDocumentation
 */

// Initialize the synth system (runs on import)
import './bootstrap';

// Extend textmode.js interfaces (imported for side effects)
import './augmentations';

export { SynthPlugin } from './plugin';

export { SynthSource } from './core/SynthSource';

export type { SynthParameterValue, SynthContext } from './core/types';

export {
	cellColor,
	char,
	charColor,
	gradient,
	noise,
	osc,
	paint,
	shape,
	solid,
	src,
	voronoi,
} from './api';

export type { ModulatedArray, EasingFunction } from './utils/ArrayUtils';

// Error handling for live coding environments
export { setGlobalErrorCallback } from './utils/SafeEvaluator';
export type { DynamicErrorCallback } from './utils/SafeEvaluator';

