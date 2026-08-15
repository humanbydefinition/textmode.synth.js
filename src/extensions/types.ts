/**
 * Public extension types.
 *
 * The public definition shape is Hydra-compatible: the five transform types,
 * declared inputs, and a GLSL body. These types are re-exported from the
 * package root.
 *
 * @module
 */

import type { SynthTransformType } from '../core/types';

/**
 * Transform type categories determining how functions compose in the shader
 * pipeline: `src`, `coord`, `color`, `combine`, and `combineCoord`.
 *
 * @category Extensibility
 *
 * @see {@link https://code.textmode.art/api/textmode.synth.js/type-aliases/TransformType | TransformType API reference}
 */
export type TransformType = SynthTransformType;

export type { TransformInput } from '../core/types';
export type { TransformDefinition } from '../transforms/TransformDefinition';
export type { ExtensionOptions, ExtensionRegistration, SourceFunction } from '../runtime/types';
