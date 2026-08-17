/**
 * @packageDocumentation
 *
 * Create shader-backed, live-coded textmode scenes by composing generators and
 * transforms into a {@link SynthSource} chain.
 *
 * ## Sketch workflow
 *
 * 1. Add {@link SynthPlugin} to the sketch's plugins.
 * 2. Start a chain with a source generator such as {@link noise} or {@link osc}.
 * 3. Shape it with coordinate, color, combination, and modulation transforms.
 * 4. Route the result to character, foreground-color, and cell-color channels
 *    with {@link char}, {@link charColor}, {@link cellColor}, and {@link paint}.
 * 5. Apply the completed chain with `t.synth(source)`.
 *
 * Use {@link src} for feedback, layer, image, or video sampling. Parameters
 * accept values, callbacks that receive {@link SynthContext}, or modulated
 * arrays for time-based motion.
 *
 * ## Origins
 *
 * textmode.synth.js adapts the compositional approach of
 * [hydra-synth](https://github.com/hydra-synth/hydra-synth) by
 * [Olivia Jack](https://github.com/ojack) for the
 * [textmode.js](https://github.com/humanbydefinition/textmode.js) ecosystem.
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
 * t.synth(synth);
 *
 * t.windowResized(() => {
 *   t.resizeCanvas(window.innerWidth, window.innerHeight);
 * });
 * ```
 *
 * @categoryDescription Workflow
 * The plugin that enables synthesis on textmode.js layers.
 *
 * @categoryDescription Synthesis Chains
 * The chainable source object that records transforms for shader compilation.
 *
 * @categoryDescription Extensibility
 * Register custom transform and source definitions with setFunction.
 *
 * @categoryDescription Sources & Sampling
 * Functions that start a chain from procedural patterns, feedback, layers, or media.
 *
 * @categoryDescription Output Channels
 * Functions that route synthesized values to characters, foreground colors, and cell colors.
 *
 * @categoryDescription Parameter Modulation
 * Values, callbacks, context, easing, and arrays for time-varying synth parameters.
 *
 * @categoryDescription Live-Coding Errors
 * Hooks for reporting invalid or failed dynamic parameter evaluation without stopping rendering.
 *
 * @showCategories
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
export { cellColor, char, charColor, gradient, moire, noise, osc, paint, plasma, shape, solid, src, voronoi };

import { EASING_FUNCTIONS } from './utils/ArrayUtils';
export { EASING_FUNCTIONS };
export type { ModulatedArray, EasingFunction } from './utils/ArrayUtils';

// Error handling for live coding environments
import { setGlobalErrorCallback } from './utils/SafeEvaluator';
export { setGlobalErrorCallback };
export type { DynamicErrorCallback } from './utils/SafeEvaluator';

// Transform extensibility
import { setFunction } from './extensions/public';
export { setFunction };

export type { SynthTransformType, TransformInput } from './core/types';
export type { TransformDefinition } from './transforms/TransformDefinition';
export type { ExtensionOptions, ExtensionRegistration, SourceFunction } from './runtime/types';

import type { TextmodePlugin } from 'textmode.js';

declare global {
	interface Window {
		SynthPlugin?: TextmodePlugin;
		SynthSource?: typeof SynthSource;
		cellColor?: typeof cellColor;
		char?: typeof char;
		charColor?: typeof charColor;
		gradient?: typeof gradient;
		moire?: typeof moire;
		noise?: typeof noise;
		osc?: typeof osc;
		paint?: typeof paint;
		plasma?: typeof plasma;
		shape?: typeof shape;
		solid?: typeof solid;
		src?: typeof src;
		voronoi?: typeof voronoi;
		setGlobalErrorCallback?: typeof setGlobalErrorCallback;
		setFunction?: typeof setFunction;
		EASING_FUNCTIONS?: typeof EASING_FUNCTIONS;
	}
}

// UMD global exports
if (typeof window !== 'undefined') {
	window.SynthPlugin = SynthPlugin;
	window.SynthSource = SynthSource;
	window.cellColor = cellColor;
	window.char = char;
	window.charColor = charColor;
	window.gradient = gradient;
	window.moire = moire;
	window.noise = noise;
	window.osc = osc;
	window.paint = paint;
	window.plasma = plasma;
	window.shape = shape;
	window.solid = solid;
	window.src = src;
	window.voronoi = voronoi;
	window.setGlobalErrorCallback = setGlobalErrorCallback;
	window.setFunction = setFunction;
	window.EASING_FUNCTIONS = EASING_FUNCTIONS;
}
