/**
 * Transform types used in the synthesis system.
 *
 * These constants are internal to the core and not exported as part of the public API,
 * reducing bundle size while maintaining type safety.
 */

/**
 * Transform type: Source generator
 */
export const TT_SRC = 'src';

/**
 * Transform type: Coordinate transform
 */
export const TT_COORD = 'coord';

/**
 * Transform type: Color transform
 */
export const TT_COLOR = 'color';

/**
 * Transform type: Combine (blend) transform
 */
export const TT_COMBINE = 'combine';

/**
 * Transform type: Coordinate modulation (combine coords)
 */
export const TT_COMBINE_COORD = 'combineCoord';

/**
 * Set of transform types that involve combining sources.
 */
export const COMBINE_TYPES = new Set([TT_COMBINE, TT_COMBINE_COORD]);

/**
 * Set of transform types that operatate on or produce coordinates.
 */
export const COORD_TYPES = new Set([TT_COORD, TT_COMBINE_COORD]);
