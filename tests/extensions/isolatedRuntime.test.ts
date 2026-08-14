import { describe, it, expect } from 'vitest';
import '../../src/bootstrap';
import { createSynthRuntime } from '../../src/extensions/public';
import { osc } from '../../src/api';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import { getRuntime } from '../../src/runtime/runtimeAccessor';
import { SynthSource } from '../../src/core/SynthSource';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';

const STRIPES: TransformDefinition = {
	name: 'stripes',
	type: 'src',
	inputs: [{ name: 'frequency', type: 'float', default: 8 }],
	glsl: 'float v = sin(_st.x * frequency * 6.2831853) * 0.5 + 0.5; return vec4(vec3(v), 1.0);',
};

function chainMethods(source: SynthSource): SynthSource & Record<string, (...args: unknown[]) => SynthSource> {
	return source as SynthSource & Record<string, (...args: unknown[]) => SynthSource>;
}

describe('createSynthRuntime (isolated runtimes)', () => {
	it('exposes built-in and custom source functions', () => {
		const synth = createSynthRuntime({ transforms: STRIPES, exposeGlobal: false });

		expect(typeof synth.sources.osc).toBe('function');
		expect(typeof synth.sources.stripes).toBe('function');

		// Custom src definition works end-to-end through the isolated compiler.
		const compiled = synth.compile(synth.sources.stripes(12).diff(synth.sources.osc(6)));
		expect(compiled.fragmentSource).toContain('tm_stripes(');
		expect(compiled.fragmentSource).toContain('tm_diff(');
	});

	it('owns a runtime-specific SynthSource subclass with chain methods', () => {
		const synth = createSynthRuntime({ transforms: STRIPES, exposeGlobal: false });
		const source = synth.createSource();
		expect(source.runtime).not.toBe(getRuntime());
		expect(source.runtime.name).toBe(synth.name);

		// Chain methods resolve through the isolated runtime.
		expect(() => chainMethods(source).osc()).not.toThrow();
		expect(() => chainMethods(source).stripes(4)).not.toThrow();
	});

	it('two runtimes can define the same name differently without sharing state', () => {
		const red = createSynthRuntime({
			name: 'red',
			transforms: { ...STRIPES, glsl: 'return vec4(1.0, 0.0, 0.0, 1.0);' },
			exposeGlobal: false,
		});
		const blue = createSynthRuntime({
			name: 'blue',
			transforms: { ...STRIPES, glsl: 'return vec4(0.0, 0.0, 1.0, 1.0);' },
			exposeGlobal: false,
		});

		const redShader = red.compile(red.sources.stripes()).fragmentSource;
		const blueShader = blue.compile(blue.sources.stripes()).fragmentSource;
		expect(redShader).toContain('vec4(1.0, 0.0, 0.0, 1.0)');
		expect(blueShader).toContain('vec4(0.0, 0.0, 1.0, 1.0)');

		// Neither leaked into the default runtime.
		expect(getRuntime().lookup('stripes')).toBeUndefined();
	});

	it('does not mutate the browser global object by default', () => {
		createSynthRuntime({ transforms: STRIPES, exposeGlobal: false });
		if (typeof window !== 'undefined') {
			expect((window as unknown as Record<string, unknown>)['stripes']).toBeUndefined();
		}
	});

	it('rejects chains that combine sources from different runtimes', () => {
		const a = createSynthRuntime({ exposeGlobal: false });
		const b = createSynthRuntime({ exposeGlobal: false });

		const fromA = a.sources.osc();
		const fromB = b.sources.osc();

		expect(() => fromA.add(fromB)).toThrow(/different synth runtimes/);
		expect(() => fromA.add(fromB)).toThrow(new RegExp(a.name));
		expect(() => fromA.add(fromB)).toThrow(new RegExp(b.name));
	});

	it('default runtime sources are unaffected by isolated runtimes', () => {
		createSynthRuntime({ transforms: STRIPES, exposeGlobal: false });
		// Default osc still compiles through the standard path.
		expect(compileSynthSource(osc(6)).fragmentSource).toContain('tm_osc(');
	});

	it('supports installation after construction', () => {
		const synth = createSynthRuntime({ exposeGlobal: false });
		const registration = synth.install(STRIPES);
		expect(synth.source('stripes')).toBeDefined();

		registration.dispose();
		expect(synth.source('stripes')).toBeUndefined();
	});
});
