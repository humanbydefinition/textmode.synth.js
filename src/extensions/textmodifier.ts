/**
 * Textmodifier extensions.
 *
 * Provides synth-related methods on the main Textmodifier instance:
 * - `bpm()` - Set global BPM for array modulation
 *
 * @internal
 */

import { setGlobalBpm } from '../core/GlobalState';

/**
 * Extend textmodifier with bpm() method.
 * @internal
 */
export function extendTextmodifierBpm(textmodifier: any) {
    textmodifier.bpm = function (value: number): number {
        setGlobalBpm(value);
        return value;
    };
}
