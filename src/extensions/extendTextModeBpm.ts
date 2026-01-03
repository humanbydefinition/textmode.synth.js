import { setGlobalBpm } from '../core/GlobalState';

export function extendTextModeBpm(textmodifier: any) {
    textmodifier.bpm = function (value: number): number {
        setGlobalBpm(value);
        return value;
    };
}
