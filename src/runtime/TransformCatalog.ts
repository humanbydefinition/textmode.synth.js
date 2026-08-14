/**
 * TransformCatalog - Runtime-owned transform registry with revision stacks.
 *
 * Each public name owns a stack of immutable {@link RegisteredTransform}
 * revisions. Installation pushes a new revision; disposal removes exactly that
 * revision and restores whatever was below it. This gives deterministic
 * replacement and cleanup semantics for live coding and extension packages.
 *
 * The catalog is an internal seam used by the runtime, bindings, and the
 * compiler. It is not part of the package interface.
 */

import type { SynthTransformType } from '../core/types';
import type { NormalizedTransformDefinition, RegisteredTransform } from '../transforms/TransformDefinition';
import { buildRegisteredTransform } from '../transforms/TransformDefinition';
import { TT_SRC } from '../core/constants';

export class TransformCatalog {
	private readonly _stacks = new Map<string, RegisteredTransform[]>();
	private readonly _revisionById = new Map<symbol, number>();
	private _revision = 0;

	/**
	 * Install a normalized definition, allocating its id and revision.
	 */
	public install(normalized: NormalizedTransformDefinition, builtIn: boolean): RegisteredTransform {
		const id = Symbol(normalized.name);
		const revision = ++this._revision;
		const registered = buildRegisteredTransform(normalized, { id, revision, builtIn });

		let stack = this._stacks.get(registered.name);
		if (!stack) {
			stack = [];
			this._stacks.set(registered.name, stack);
		}
		stack.push(registered);
		this._revisionById.set(id, revision);

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
		this._revisionById.delete(registered.id);
		return true;
	}

	/** The current (top-of-stack) registration for a name, if any. */
	public current(name: string): RegisteredTransform | undefined {
		const stack = this._stacks.get(name);
		return stack?.[stack.length - 1];
	}

	/** All revisions for a name, oldest first. */
	public revisions(name: string): readonly RegisteredTransform[] {
		return this._stacks.get(name) ?? [];
	}

	public has(name: string): boolean {
		return this._stacks.has(name);
	}

	public names(): string[] {
		return Array.from(this._stacks.keys());
	}

	public all(): RegisteredTransform[] {
		return Array.from(this._stacks.values())
			.map((stack) => stack[stack.length - 1])
			.filter((entry): entry is RegisteredTransform => entry !== undefined);
	}

	public byType(type: SynthTransformType): RegisteredTransform[] {
		return this.all().filter((entry) => entry.type === type);
	}

	public sourceTransforms(): RegisteredTransform[] {
		return this.byType(TT_SRC);
	}

	public get size(): number {
		return this._stacks.size;
	}

	public clear(): void {
		this._stacks.clear();
		this._revisionById.clear();
		this._revision = 0;
	}
}
