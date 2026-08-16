import type { SynthParameterValue } from './types';
import type { RegisteredTransform } from '../transforms/TransformDefinition';

/**
 * A recorded transform in the synthesis chain.
 *
 * `transform` is an immutable registered-definition snapshot captured when the
 * chain method was called. Redefining or disposing a transform therefore
 * affects future chains only; a captured chain keeps compiling with the
 * definition it recorded. The field is optional so plain records can be
 * constructed for tests and migration code; chains built through
 * {@link SynthSource} always carry a snapshot.
 */
export interface TransformRecord {
	/** Transform function name */
	name: string;
	/** User-provided arguments */
	userArgs: SynthParameterValue[];
	/** Immutable registration snapshot captured at call time */
	transform?: RegisteredTransform;
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
}
