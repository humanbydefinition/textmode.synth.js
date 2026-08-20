/**
 * TransformCatalog - Runtime-owned transform registry with per-name stacks.
 *
 * Each public name owns a stack of immutable {@link RegisteredTransform}
 * instances. Installation pushes a new entry; disposal removes exactly that
 * entry and restores whatever was below it. This gives deterministic
 * replacement and cleanup semantics for live coding and extension packages.
 *
 * The catalog is an internal seam used by the runtime, bindings, and the
 * compiler. It is not part of the package interface.
 */

import type { NormalizedTransformDefinition, RegisteredTransform } from '../transforms/TransformDefinition';
import { buildRegisteredTransform } from '../transforms/TransformDefinition';

export class TransformCatalog {
	private readonly _stacks = new Map<string, RegisteredTransform[]>();

	/**
	 * Install a normalized definition, allocating its id.
	 */
	public install(normalized: NormalizedTransformDefinition, builtIn: boolean): RegisteredTransform {
		const id = Symbol(normalized.name);
		const registered = buildRegisteredTransform(normalized, { id, builtIn });

		let stack = this._stacks.get(registered.name);
		if (!stack) {
			stack = [];
			this._stacks.set(registered.name, stack);
		}
		stack.push(registered);

		return registered;
	}

	/**
	 * Remove exactly this registration. Idempotent: a registration that was
	 * already disposed (or shadowed and disposed out of order) is a no-op.
	 */
	public dispose(registered: RegisteredTransform): boolean {
		const stack = this._stacks.get(registered.name);
		if (!stack) return false;
		const index = stack.indexOf(registered);
		if (index === -1) return false;
		stack.splice(index, 1);
		if (stack.length === 0) {
			this._stacks.delete(registered.name);
		}
		return true;
	}

	/** The current (top-of-stack) registration for a name, if any. */
	public current(name: string): RegisteredTransform | undefined {
		const stack = this._stacks.get(name);
		return stack?.[stack.length - 1];
	}
}
