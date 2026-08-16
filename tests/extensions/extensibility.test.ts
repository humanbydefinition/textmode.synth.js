import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/bootstrap';
import { osc, noise, solid } from '../../src/api';
import { setFunction } from '../../src/extensions/public';
import { getRuntime } from '../../src/runtime/runtimeAccessor';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import { SynthSource } from '../../src/core/SynthSource';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

const STRIPES: TransformDefinition = {
	name: 'stripes',
	type: 'src',
	inputs: [{ name: 'frequency', type: 'float', default: 8 }],
	glsl: `
	float value = sin((_st.x + time * 0.05) * frequency * 6.2831853) * 0.5 + 0.5;
	return vec4(vec3(value), 1.0);
`,
};

const DUOTONE: TransformDefinition = {
	name: 'duotone',
	type: 'color',
	inputs: [
		{ name: 'low', type: 'vec3', default: [0.02, 0.04, 0.12] },
		{ name: 'high', type: 'vec3', default: [1.0, 0.4, 0.1] },
	],
	glsl: `
	float value = _luminance(_c0.rgb);
	return vec4(mix(low, high, value), _c0.a);
`,
};

const BLEND2: TransformDefinition = {
	name: 'blend2',
	type: 'combine',
	inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
	glsl: 'return _c0 * (1.0 - amount) + _c1 * amount;',
};

describe('transform extensibility', () => {
	let registrations: Array<{ dispose(): void }> = [];

	beforeEach(() => {
		registrations = [];
	});

	afterEach(() => {
		for (const registration of registrations) {
			registration.dispose();
		}
		registrations = [];
		// Restore a clean default runtime for the next test.
		getRuntime();
	});

	describe('setFunction', () => {
		it('registers a Hydra-style source definition usable as a chain and standalone', () => {
			const registration = setFunction(STRIPES, { exposeGlobal: false });
			registrations.push(registration);

			expect(registration.names).toContain('stripes');
			expect(typeof registration.sources.stripes).toBe('function');

			// Standalone function starts a chain.
			const chain = registration.sources.stripes(12);
			expect(chain.transforms[0].name).toBe('stripes');
			expect(chain.transforms[0].userArgs).toEqual([12]);

			// Chain method also works on any source.
			const chained = chainMethods(osc()).stripes(6);
			expect(chained.transforms[1].name).toBe('stripes');

			// Compiles end-to-end through the standard pipeline.
			const compiled = compileSynthSource(chainMethods(osc()).stripes(6).rotate(0.1));
			expect(compiled.fragmentSource).toContain('vec4 tm_stripes(vec2 _st, float frequency)');
			expect(compiled.fragmentSource).toContain('tm_stripes(');
		});

		it('all five transform types register and compile', () => {
			const colorDef: TransformDefinition = {
				name: 'grayscale',
				type: 'color',
				inputs: [{ name: 'amount', type: 'float', default: 1 }],
				glsl: 'float v = _luminance(_c0.rgb); return vec4(vec3(mix(_c0.rgb, vec3(v), amount)), _c0.a);',
			};
			const coordDef: TransformDefinition = {
				name: 'squishX',
				type: 'coord',
				inputs: [{ name: 'amount', type: 'float', default: 0.5 }],
				glsl: 'return vec2(_st.x * amount, _st.y);',
			};
			const combineCoordDef: TransformDefinition = {
				name: 'shiftBy',
				type: 'combineCoord',
				inputs: [{ name: 'scale', type: 'float', default: 1 }],
				glsl: 'return _st + _c0.xy * scale;',
			};
			registrations.push(setFunction(colorDef, { exposeGlobal: false }));
			registrations.push(setFunction(coordDef, { exposeGlobal: false }));
			registrations.push(setFunction(combineCoordDef, { exposeGlobal: false }));
			registrations.push(setFunction(BLEND2, { exposeGlobal: false }));

			const chain = chainMethods(
				chainMethods(chainMethods(chainMethods(osc()).squishX(0.8)).grayscale()).blend2(solid(1, 0, 0))
			).shiftBy(osc(), 0.5) as SynthSource;
			const compiled = compileSynthSource(chain);
			expect(compiled.fragmentSource).toContain('vec4 tm_grayscale(vec4 _c0, float amount)');
			expect(compiled.fragmentSource).toContain('vec2 tm_squishX(vec2 _st, float amount)');
			expect(compiled.fragmentSource).toContain('vec4 tm_blend2(vec4 _c0, vec4 _c1, float amount)');
			expect(compiled.fragmentSource).toContain('vec2 tm_shiftBy(vec2 _st, vec4 _c0, float scale)');
		});

		it('default conflict policy is replace, including built-ins', () => {
			const before = compileSynthSource(noise(5)).fragmentSource;
			const replacement = setFunction(
				{
					name: 'noise',
					type: 'src',
					inputs: [{ name: 'scale', type: 'float', default: 10 }],
					glsl: 'return vec4(1.0, 0.0, 0.0, 1.0);',
				},
				{ exposeGlobal: false }
			);
			registrations.push(replacement);

			// Future chains use the replacement definition.
			const after = compileSynthSource(noise(5)).fragmentSource;
			expect(after).not.toBe(before);
			expect(after).toContain('tm_noise(');
		});

		it('rejects an invalid definition synchronously without mutation', () => {
			expect(() =>
				setFunction({ name: 'bad name!', type: 'src', inputs: [], glsl: 'return vec4(1.0);' })
			).toThrow(/not a valid JavaScript identifier/);

			// Nothing was installed.
			expect(getRuntime().lookup('bad name!')).toBeUndefined();
		});

		it('supports the documented Hydra gradient2 example end-to-end', () => {
			const registration = setFunction(
				{
					name: 'gradient2',
					type: 'src',
					inputs: [{ name: 'speed', type: 'float', default: 0 }],
					glsl: 'return vec4(sin(time * speed), _st, 1.0);',
				},
				{ exposeGlobal: false }
			);
			registrations.push(registration);

			// ESM: use the returned function.
			const source = registration.sources.gradient2(0.2).rotate(0.1);
			const compiled = compileSynthSource(source);
			expect(compiled.fragmentSource).toContain('tm_gradient2(');
			expect(compiled.fragmentSource).toContain('vec4 tm_gradient2(vec2 _st, float speed)');

			// Clean disposal removes the method; the typed escape hatch fails fast.
			registration.dispose();
			expect(() => new SynthSource().transform('gradient2', 0.2)).toThrow(/Unknown transform "gradient2"/);
		});
	});

	describe('setFunction batch install', () => {
		it('installs a batch atomically', () => {
			const registration = setFunction([STRIPES, DUOTONE, BLEND2], { exposeGlobal: false });
			registrations.push(registration);
			expect(registration.names).toEqual(['stripes', 'duotone', 'blend2']);
			expect(registration.sources.stripes).toBeDefined();
		});

		it('rolls back the whole batch if one definition is invalid', () => {
			expect(() =>
				setFunction(
					[
						STRIPES,
						{
							name: 'broken',
							type: 'color',
							inputs: [{ name: 'v', type: 'vec3', default: [1] }],
							glsl: 'return _c0;',
						},
					],
					{ exposeGlobal: false }
				)
			).toThrow();

			// No member of the failed batch was installed.
			expect(getRuntime().lookup('stripes')).toBeUndefined();
			expect(getRuntime().lookup('broken')).toBeUndefined();
		});

		it('rejects name collisions with an explicit error conflict policy', () => {
			registrations.push(setFunction(STRIPES, { exposeGlobal: false }));
			expect(() => setFunction(STRIPES, { conflict: 'error', exposeGlobal: false })).toThrow(
				/already registered/
			);
		});

		it('refuses to overwrite a built-in with an error conflict policy', () => {
			expect(() =>
				setFunction({ name: 'osc', type: 'src', inputs: [], glsl: 'return vec4(1.0);' }, { conflict: 'error' })
			).toThrow(/built-in/);
		});

		it('allows replacement with an explicit conflict option', () => {
			const first = setFunction(STRIPES, { exposeGlobal: false });
			registrations.push(first);
			const second = setFunction(
				{ ...STRIPES, glsl: 'return vec4(0.0, 1.0, 0.0, 1.0);' },
				{ conflict: 'replace', exposeGlobal: false }
			);
			registrations.push(second);

			const compiled = compileSynthSource(second.sources.stripes());
			expect(compiled.fragmentSource).toContain('vec4(0.0, 1.0, 0.0, 1.0)');
		});
	});

	describe('setFunction source definitions', () => {
		it('returns the standalone source function from registration.sources', () => {
			const registration = setFunction(STRIPES, { exposeGlobal: false });
			registrations.push(registration);

			const stripes = registration.sources.stripes;
			expect(typeof stripes).toBe('function');
			expect(registration.names).toEqual(['stripes']);

			const source = stripes(12);
			expect(source.transforms[0].name).toBe('stripes');
			expect(source.transforms[0].userArgs).toEqual([12]);
		});

		it('works through the full fluent pipeline', () => {
			const stripes = setFunction(STRIPES, { exposeGlobal: false });
			registrations.push(stripes);
			const duotone = setFunction(DUOTONE, { exposeGlobal: false });
			registrations.push(duotone);

			const source = chainMethods(stripes.sources.stripes(4)).duotone();
			const compiled = compileSynthSource(source);
			expect(compiled.fragmentSource).toContain('tm_duotone(');
			expect(compiled.fragmentSource).toContain('tm_stripes(');
		});
	});

	describe('chain snapshot semantics', () => {
		it('redefining a function affects future chains but not existing chains', () => {
			registrations.push(setFunction(STRIPES, { exposeGlobal: false }));

			const oldChain = stripesChain(12);
			const oldShader = compileSynthSource(oldChain).fragmentSource;

			registrations.push(
				setFunction({ ...STRIPES, glsl: 'return vec4(0.0, 0.0, 1.0, 1.0);' }, { exposeGlobal: false })
			);

			const newShader = compileSynthSource(stripesChain(12)).fragmentSource;
			expect(newShader).not.toBe(oldShader);

			// The old chain still captures its original definition.
			const oldStill = compileSynthSource(oldChain).fragmentSource;
			expect(oldStill).toBe(oldShader);
		});

		it('disposing an extension does not invalidate captured chains', () => {
			const registration = setFunction(STRIPES, { exposeGlobal: false });
			const chain = stripesChain(12);
			const shader = compileSynthSource(chain).fragmentSource;

			registration.dispose();

			// The chain remains compilable with its captured definition.
			expect(compileSynthSource(chain).fragmentSource).toBe(shader);
			// New chains now fail fast at construction.
			expect(() => stripesChain(12)).toThrow(/Unknown transform "stripes"/);
		});
	});

	describe('registration lifecycle', () => {
		it('dispose restores the previous binding (method + source function)', () => {
			const first = setFunction(
				{ ...STRIPES, inputs: [{ name: 'frequency', type: 'float', default: 1 }] },
				{ exposeGlobal: false }
			);
			expect(stripesChain().transforms[0].userArgs).toEqual([1]);

			const second = setFunction(
				{ ...STRIPES, inputs: [{ name: 'frequency', type: 'float', default: 8 }] },
				{ exposeGlobal: false }
			);
			registrations.push(second);
			expect(stripesChain().transforms[0].userArgs).toEqual([8]);

			const third = setFunction(
				{ ...STRIPES, inputs: [{ name: 'frequency', type: 'float', default: 20 }] },
				{ exposeGlobal: false }
			);
			expect(stripesChain().transforms[0].userArgs).toEqual([20]);

			// Dispose the newest: the previous default (8) is restored.
			third.dispose();
			expect(stripesChain().transforms[0].userArgs).toEqual([8]);

			// Dispose the middle: back to the first registration.
			second.dispose();
			expect(stripesChain().transforms[0].userArgs).toEqual([1]);

			// Dispose the original: the method is removed entirely.
			first.dispose();
			expect(() => stripesChain()).toThrow(/Unknown transform/);
		});

		it('disposing an older shadowed handle does not remove the newer registration', () => {
			const older = setFunction(STRIPES, { exposeGlobal: false });
			registrations.push(setFunction({ ...STRIPES, name: 'stripes' }, { exposeGlobal: false }));
			registrations.push(setFunction({ ...STRIPES, name: 'stripes' }, { exposeGlobal: false }));

			older.dispose();
			// Newest registration is still active.
			expect(() => stripesChain(5)).not.toThrow();
		});
	});

	describe('transform() escape hatch', () => {
		it('uses the same runtime lookup and chain recording as injected methods', () => {
			registrations.push(setFunction(STRIPES, { exposeGlobal: false }));

			const source = new SynthSource().transform('stripes', 7);
			expect(source.transforms[0].name).toBe('stripes');
			expect(source.transforms[0].userArgs).toEqual([7]);

			const compiled = compileSynthSource(source);
			expect(compiled.fragmentSource).toContain('tm_stripes(');
		});

		it('throws for unknown transforms', () => {
			expect(() => new SynthSource().transform('nope', 1)).toThrow(/Unknown transform "nope"/);
		});
	});
});

/** Build a stripes chain by calling the registered method directly. */
function stripesChain(freq?: number): SynthSource {
	return chainMethods(new SynthSource()).stripes(freq);
}

/** Cast a SynthSource to expose dynamically injected chain methods. */
function chainMethods(source: SynthSource): SynthSource & Record<string, (...args: unknown[]) => SynthSource> {
	return source as SynthSource & Record<string, (...args: unknown[]) => SynthSource>;
}
