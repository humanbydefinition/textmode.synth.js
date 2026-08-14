import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index';
import { setFunction, extendTransforms } from '../../src/extensions/public';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

const STRIPES: TransformDefinition = {
	name: 'stripes',
	type: 'src',
	inputs: [{ name: 'frequency', type: 'float', default: 8 }],
	glsl: 'return vec4(vec3(_st.x * frequency), 1.0);',
};

describe('global exposure', () => {
	const disposed: Array<() => void> = [];

	afterEach(() => {
		for (const dispose of disposed.splice(0)) {
			dispose();
		}
	});

	const global = (): Record<string, unknown> =>
		typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : {};

	it('exposes a src definition on window by default in browser environments', () => {
		expect(global()['stripes']).toBeUndefined();
		const registration = setFunction(STRIPES);
		disposed.push(() => registration.dispose());

		expect(typeof global()['stripes']).toBe('function');
	});

	it('does not expose when exposeGlobal is false', () => {
		const registration = setFunction(STRIPES, { exposeGlobal: false });
		disposed.push(() => registration.dispose());

		expect(global()['stripes']).toBeUndefined();
	});

	it('does not create globals for non-src transforms', () => {
		const colorDef: TransformDefinition = {
			name: 'myTint',
			type: 'color',
			inputs: [],
			glsl: 'return _c0;',
		};
		const registration = extendTransforms(colorDef);
		disposed.push(() => registration.dispose());

		expect(global()['myTint']).toBeUndefined();
	});

	it('dispose restores the previous global property descriptor', () => {
		const previous = () => 'previous';
		(window as unknown as Record<string, unknown>)['stripes'] = previous;

		const registration = setFunction(STRIPES);
		expect(global()['stripes']).not.toBe(previous);

		registration.dispose();
		expect(global()['stripes']).toBe(previous);
		delete (window as unknown as Record<string, unknown>)['stripes'];
	});

	it('dispose removes a global that did not exist before', () => {
		delete (window as unknown as Record<string, unknown>)['stripes'];

		const registration = setFunction(STRIPES);
		expect(global()['stripes']).toBeDefined();

		registration.dispose();
		expect(global()['stripes']).toBeUndefined();
	});

	it('replacement shadows and restores globals in LIFO order', () => {
		const a = setFunction(STRIPES);
		disposed.push(() => a.dispose());
		const fnA = global()['stripes'];

		const b = setFunction({ ...STRIPES, name: 'stripes' });
		disposed.push(() => b.dispose());
		const fnB = global()['stripes'];
		expect(fnB).not.toBe(fnA);

		b.dispose();
		expect(global()['stripes']).toBe(fnA);
	});
});
