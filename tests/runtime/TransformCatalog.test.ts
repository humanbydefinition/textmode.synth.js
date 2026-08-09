import { describe, it, expect, beforeEach } from 'vitest';
import { TransformCatalog } from '../../src/runtime/TransformCatalog';
import { normalizeDefinition } from '../../src/runtime/TransformValidator';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

function makeDef(name: string, glsl = 'return _c0;'): TransformDefinition {
	return { name, type: 'color', inputs: [], glsl };
}

describe('TransformCatalog', () => {
	let catalog: TransformCatalog;

	beforeEach(() => {
		catalog = new TransformCatalog();
	});

	it('installs definitions with monotonically increasing revisions', () => {
		const a = catalog.install(normalizeDefinition(makeDef('first')), false);
		const b = catalog.install(normalizeDefinition(makeDef('second')), false);
		expect(a.revision).toBe(1);
		expect(b.revision).toBe(2);
		expect(b.revision).toBeGreaterThan(a.revision);
	});

	it('returns the top-of-stack registration as current', () => {
		const first = catalog.install(normalizeDefinition(makeDef('tint')), false);
		expect(catalog.current('tint')).toBe(first);

		const second = catalog.install(normalizeDefinition(makeDef('tint', 'return _c0 * 0.5;')), false);
		expect(catalog.current('tint')).toBe(second);
		expect(catalog.revisions('tint')).toHaveLength(2);
	});

	it('disposal restores the previous registration', () => {
		const first = catalog.install(normalizeDefinition(makeDef('tint')), false);
		const second = catalog.install(normalizeDefinition(makeDef('tint', 'return _c0 * 0.5;')), false);

		expect(catalog.dispose(second)).toBe(true);
		expect(catalog.current('tint')).toBe(first);
	});

	it('disposing a shadowed registration does not disturb the current one', () => {
		const first = catalog.install(normalizeDefinition(makeDef('tint')), false);
		const second = catalog.install(normalizeDefinition(makeDef('tint', 'return _c0 * 0.5;')), false);
		const third = catalog.install(normalizeDefinition(makeDef('tint', 'return _c0 * 0.25;')), false);

		// Dispose the oldest while newer ones remain.
		expect(catalog.dispose(first)).toBe(true);
		expect(catalog.current('tint')).toBe(third);
		expect(catalog.revisions('tint')).toEqual([second, third]);

		// Then dispose the current to fall back to the middle one.
		expect(catalog.dispose(third)).toBe(true);
		expect(catalog.current('tint')).toBe(second);
	});

	it('disposal is idempotent', () => {
		const entry = catalog.install(normalizeDefinition(makeDef('tint')), false);
		expect(catalog.dispose(entry)).toBe(true);
		expect(catalog.dispose(entry)).toBe(false);
		expect(catalog.current('tint')).toBeUndefined();
	});

	it('reports all, by-type, and source transforms', () => {
		catalog.install(normalizeDefinition(makeDef('tint')), false); // color
		const src = catalog.install(
			normalizeDefinition({ name: 'waves', type: 'src', inputs: [], glsl: 'return vec4(1.0);' }),
			false
		);
		expect(catalog.size).toBe(2);
		expect(catalog.byType('color')).toHaveLength(1);
		expect(catalog.sourceTransforms()).toEqual([src]);
		expect(catalog.names().sort()).toEqual(['tint', 'waves']);
	});

	it('clear removes all registrations', () => {
		catalog.install(normalizeDefinition(makeDef('tint')), false);
		catalog.install(normalizeDefinition(makeDef('waves', 'return vec4(1.0);')), false);
		catalog.clear();
		expect(catalog.size).toBe(0);
		expect(catalog.all()).toHaveLength(0);
	});

	it('keeps built-in flag on the registration', () => {
		const entry = catalog.install(normalizeDefinition(makeDef('tint')), true);
		expect(entry.builtIn).toBe(true);
		expect(entry.id).toBeTypeOf('symbol');
	});
});
