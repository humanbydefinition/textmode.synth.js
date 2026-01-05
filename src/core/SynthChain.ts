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
export class SynthChain {
	/** The transforms in this chain */
	private _transforms: TransformRecord[];

	/**
	 * Create a new SynthChain with the given transforms.
	 */
	private constructor(transforms: TransformRecord[]) {
		this._transforms = transforms;
	}

	/**
	 * Create an empty chain.
	 */
	public static empty(): SynthChain {
		return new SynthChain([]);
	}

	/**
	 * Create a chain from existing transforms.
	 */
	public static from(transforms: readonly TransformRecord[]): SynthChain {
		return new SynthChain([...transforms]);
	}

	/**
	 * Get all transforms in this chain (readonly view).
	 */
	public get transforms(): readonly TransformRecord[] {
		return this._transforms;
	}

	/**
	 * Push a transform to this chain (internal mutation).
	 */
	public push(record: TransformRecord): void {
		this._transforms.push(record);
	}

	/**
	 * Get the number of transforms in this chain.
	 */
	public get length(): number {
		return this._transforms.length;
	}

	/**
	 * Check if the chain is empty.
	 */
	public get isEmpty(): boolean {
		return this._transforms.length === 0;
	}

	/**
	 * Append a transform to this chain, returning a new chain.
	 */
	public append(record: TransformRecord): SynthChain {
		return new SynthChain([...this._transforms, record]);
	}

	/**
	 * Get a transform at a specific index.
	 */
	public get(index: number): TransformRecord | undefined {
		return this._transforms[index];
	}

	/**
	 * Create an iterator over the transforms.
	 */
	public [Symbol.iterator](): Iterator<TransformRecord> {
		return this._transforms[Symbol.iterator]();
	}
}
