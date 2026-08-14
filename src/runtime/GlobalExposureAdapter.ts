/**
 * GlobalExposureAdapter - Exposes runtime source functions as browser globals.
 *
 * Isolation for live-coding environments: installation records the previous
 * property descriptor and disposal restores it. Exposure is skipped entirely
 * when no browser global object is available (ESM/Node), so package consumers
 * are never polluted.
 */

interface ExposureState {
	descriptor: PropertyDescriptor | 'absent';
}

function getGlobalTarget(): Record<string, unknown> | undefined {
	if (typeof window !== 'undefined') {
		return window as unknown as Record<string, unknown>;
	}
	return undefined;
}

export class GlobalExposureAdapter {
	private readonly _states = new Map<string, ExposureState[]>();

	/**
	 * Expose a value as a global property, recording the prior descriptor.
	 */
	public expose(name: string, value: unknown): void {
		const target = getGlobalTarget();
		if (!target) return;

		const stack = this._states.get(name) ?? [];
		const existing = Object.getOwnPropertyDescriptor(target, name);
		stack.push({ descriptor: existing ?? 'absent' });
		this._states.set(name, stack);

		Object.defineProperty(target, name, {
			value,
			writable: true,
			configurable: true,
			enumerable: true,
		});
	}

	/**
	 * Restore the previous global property descriptor for a name.
	 * Idempotent: restoring a name that is not currently exposed is a no-op.
	 */
	public restore(name: string): void {
		const stack = this._states.get(name);
		if (!stack || stack.length === 0) return;

		const previous = stack.pop()!;
		const target = getGlobalTarget();
		if (target) {
			if (previous.descriptor === 'absent') {
				delete target[name];
			} else {
				Object.defineProperty(target, name, previous.descriptor);
			}
		}

		if (stack.length === 0) {
			this._states.delete(name);
		}
	}
}
