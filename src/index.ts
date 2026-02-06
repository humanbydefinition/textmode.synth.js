/**
 *
 * A derivative work of [hydra-synth](https://github.com/hydra-synth/hydra-synth) by [Olivia Jack](https://github.com/ojack),
 * adapted for the [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem, providing
 * a visual synthesis system for procedural generation of characters, colors,
 * and visual effects through method chaining.
 *
 * @example
 * ```javascript
 * const t = textmode.create({
 *   width: window.innerWidth,
 *   height: window.innerHeight,
 *   plugins: [SynthPlugin]
 * });
 *
 * const synth = noise(8)
 *   .rotate(0.2)
 *   .kaleid(5)
 *   .charColor(osc(6, 0.1, 1.2))
 *   .cellColor(osc(6, 0.1, 1.2).invert())
 *   .charMap('@#%*+=-:. ');
 *
 * t.layers.base.synth(synth);
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 *
 * @packageDocumentation
 */

// Initialize the synth system (runs on import)
import './bootstrap';

// Extend textmode.js interfaces (imported for side effects)
import './augmentations';

import { SynthPlugin } from './plugin';
export { SynthPlugin };

import { SynthSource } from './core/SynthSource';
export { SynthSource };

export type { SynthParameterValue, SynthContext } from './core/types';

import {
	cellColor,
	char,
	charColor,
	gradient,
	moire,
	noise,
	osc,
	paint,
	plasma,
	shape,
	solid,
	src,
	voronoi,
} from './api';
export {
	cellColor,
	char,
	charColor,
	gradient,
	moire,
	noise,
	osc,
	paint,
	plasma,
	shape,
	solid,
	src,
	voronoi,
};

export type { ModulatedArray, EasingFunction } from './utils/ArrayUtils';

// Error handling for live coding environments
import { setGlobalErrorCallback } from './utils/SafeEvaluator';
export { setGlobalErrorCallback };
export type { DynamicErrorCallback } from './utils/SafeEvaluator';

// UMD global exports
if (typeof window !== 'undefined') {
	(window as any).SynthPlugin = SynthPlugin;
	(window as any).SynthSource = SynthSource;
	(window as any).cellColor = cellColor;
	(window as any).char = char;
	(window as any).charColor = charColor;
	(window as any).gradient = gradient;
	(window as any).moire = moire;
	(window as any).noise = noise;
	(window as any).osc = osc;
	(window as any).paint = paint;
	(window as any).plasma = plasma;
	(window as any).shape = shape;
	(window as any).solid = solid;
	(window as any).src = src;
	(window as any).voronoi = voronoi;
	(window as any).setGlobalErrorCallback = setGlobalErrorCallback;
}
