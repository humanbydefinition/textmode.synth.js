/**
 * Categories index - exports all transform categories.
 */

import { SOURCE_TRANSFORMS } from './sources';
import { COORD_TRANSFORMS } from './coordinates';
import { COLOR_TRANSFORMS } from './colors';
import { COMBINE_TRANSFORMS } from './combine';
import { COMBINE_COORD_TRANSFORMS } from './combineCoord';
import type { TransformDefinition } from '../TransformDefinition';

export { SOURCE_TRANSFORMS, COORD_TRANSFORMS, COLOR_TRANSFORMS, COMBINE_TRANSFORMS, COMBINE_COORD_TRANSFORMS };

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
