/**
 * Categories index - exports all transform categories.
 */

export { SOURCE_TRANSFORMS, osc, noise, voronoi, gradient, shape, solid, src } from './sources';
export {
	COORD_TRANSFORMS,
	rotate,
	scale,
	scroll,
	scrollX,
	scrollY,
	pixelate,
	repeat,
	repeatX,
	repeatY,
	kaleid,
} from './coordinates';
export {
	COLOR_TRANSFORMS,
	brightness,
	contrast,
	invert,
	saturate,
	hue,
	colorama,
	posterize,
	luma,
	thresh,
	color,
	r,
	g,
	b,
} from './colors';
export { COMBINE_TRANSFORMS, add, sub, mult, blend, diff, layer, mask } from './combine';
export {
	COMBINE_COORD_TRANSFORMS,
	modulate,
	modulateScale,
	modulateRotate,
	modulatePixelate,
	modulateKaleid,
	modulateScrollX,
	modulateScrollY,
} from './combineCoord';

import { SOURCE_TRANSFORMS } from './sources';
import { COORD_TRANSFORMS } from './coordinates';
import { COLOR_TRANSFORMS } from './colors';
import { COMBINE_TRANSFORMS } from './combine';
import { COMBINE_COORD_TRANSFORMS } from './combineCoord';
import type { TransformDefinition } from '../TransformDefinition';

/**
 * All built-in transforms combined.
 */
export const ALL_TRANSFORMS: TransformDefinition[] = [
	...SOURCE_TRANSFORMS,
	...COORD_TRANSFORMS,
	...COLOR_TRANSFORMS,
	...COMBINE_TRANSFORMS,
	...COMBINE_COORD_TRANSFORMS,
];
