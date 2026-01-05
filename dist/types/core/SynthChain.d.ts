import type { SynthParameterValue } from './types';
/**
 * A recorded transform in the synthesis chain.
 */
export interface TransformRecord {
    /** Transform function name */
    name: string;
    /** User-provided arguments */
    userArgs: SynthParameterValue[];
}
/**
 * A mutable chain of transform records for the fluent API.
 * While the internal implementation is mutable for compatibility with the
 * existing fluent API, the returned readonly arrays provide a consistent view.
 */
export declare class SynthChain {
    /** The transforms in this chain */
    private _transforms;
    /**
     * Create a new SynthChain with the given transforms.
     */
    private constructor();
    /**
     * Create an empty chain.
     */
    static empty(): SynthChain;
    /**
     * Create a chain from existing transforms.
     */
    static from(transforms: readonly TransformRecord[]): SynthChain;
    /**
     * Get all transforms in this chain (readonly view).
     */
    get transforms(): readonly TransformRecord[];
    /**
     * Push a transform to this chain (internal mutation).
     */
    push(record: TransformRecord): void;
    /**
     * Get the number of transforms in this chain.
     */
    get length(): number;
    /**
     * Check if the chain is empty.
     */
    get isEmpty(): boolean;
    /**
     * Append a transform to this chain, returning a new chain.
     */
    append(record: TransformRecord): SynthChain;
    /**
     * Get a transform at a specific index.
     */
    get(index: number): TransformRecord | undefined;
    /**
     * Create an iterator over the transforms.
     */
    [Symbol.iterator](): Iterator<TransformRecord>;
}
//# sourceMappingURL=SynthChain.d.ts.map