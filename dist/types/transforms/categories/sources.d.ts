/**
 * Source generator transforms.
 *
 * These transforms create base visual patterns from UV coordinates.
 * They are the starting point of most synth chains.
 */
import { type TransformDefinition } from '../TransformDefinition';
export declare const osc: TransformDefinition;
export declare const noise: TransformDefinition;
export declare const voronoi: TransformDefinition;
export declare const gradient: TransformDefinition;
export declare const shape: TransformDefinition;
export declare const solid: TransformDefinition;
/**
 * Sample the previous frame's primary color output for feedback effects.
 * This is the core of feedback loops - it reads from the previous frame's
 * primary color texture (character foreground color), enabling effects like
 * trails, motion blur, and recursive patterns.
 *
 * When called without arguments (or with a self-reference), samples from
 * the current layer's previous frame. When called with another layer's
 * output reference, samples from that layer's last rendered frame.
 *
 * Equivalent to hydra's `src(o0)` / `src(o1)`.
 *
 * @example
 * ```typescript
 * // Self-feedback (classic hydra-style) - same as src(o0) in hydra
 * src().modulate(noise(3), 0.005).blend(shape(4), 0.01)
 *
 * // Feedback with color shift
 * src().hue(0.01).scale(1.01).blend(osc(10), 0.1)
 *
 * // Cross-layer reference (like src(o1) in hydra)
 * const o1 = createOutput(layer1);
 * layer0.synth(src(o1).blend(osc(10), 0.1));
 * ```
 */
export declare const src: TransformDefinition;
/**
 * Sample the previous frame's character data for feedback effects.
 * Reads from the previous frame's character texture (attachment 0), which contains
 * character index and transform data.
 *
 * When called without arguments (or with a self-reference), samples from
 * the current layer's previous frame. When called with another layer's
 * output reference, samples from that layer's last rendered frame.
 *
 * Use this to create feedback loops that affect character selection.
 *
 * @example
 * ```typescript
 * // Character feedback with modulation (self-reference)
 * charSrc().modulate(noise(3), 0.01)
 *
 * // Cross-layer character reference
 * const o1 = createOutput(layer1);
 * layer0.synth(charSrc(o1).modulate(osc(5), 0.02));
 * ```
 */
export declare const charSrc: TransformDefinition;
/**
 * Sample the previous frame's cell/secondary color for feedback effects.
 * Reads from the previous frame's secondary color texture (attachment 2), which contains
 * the cell background color.
 *
 * When called without arguments (or with a self-reference), samples from
 * the current layer's previous frame. When called with another layer's
 * output reference, samples from that layer's last rendered frame.
 *
 * Use this to create feedback loops that affect cell background colors.
 *
 * @example
 * ```typescript
 * // Cell color feedback (self-reference)
 * cellColorSrc().hue(0.01).blend(solid(0, 0, 0), 0.1)
 *
 * // Cross-layer cell color reference
 * const o1 = createOutput(layer1);
 * layer0.synth(cellColorSrc(o1).blend(osc(10), 0.2));
 * ```
 */
export declare const cellColorSrc: TransformDefinition;
/**
 * All source generator transforms.
 */
export declare const SOURCE_TRANSFORMS: TransformDefinition[];
//# sourceMappingURL=sources.d.ts.map