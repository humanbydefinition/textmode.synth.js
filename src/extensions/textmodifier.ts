/**
 * Textmodifier extensions.
 *
 * Provides synth-related methods on the main Textmodifier instance:
 * - `bpm()` - Set global BPM for array modulation
 */

import { Textmodifier } from 'textmode.js';
import { setGlobalBpm } from '../core/GlobalState';

/**
 * Extend textmodifier with bpm() method.
 */
export function extendTextmodifierBpm(textmodifier: Textmodifier): void {
	textmodifier.bpm = function (value: number): number {
		setGlobalBpm(value);
		return value;
	};
}
