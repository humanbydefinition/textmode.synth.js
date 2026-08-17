import { describe, it, expect, afterEach } from 'vitest';
import '../../src/bootstrap';
import { osc, noise } from '../../src/api';
import { setFunction } from '../../src/extensions/public';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import { collectTextmodeSourceRefs } from '../../src/utils/collectTextmodeSourceRefs';
import type { TransformDefinition } from '../../src/transforms/TransformDefinition';
import type { SynthSource } from '../../src/core/SynthSource';
import type { TextmodeSource } from 'textmode.js';

const VECTOR_TINT: TransformDefinition = {
	name: 'vectint',
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

const BINNING: TransformDefinition = {
	name: 'binning',
	type: 'color',
	inputs: [{ name: 'steps', type: 'int', default: 8 }],
	glsl: 'return vec4(floor(_c0.rgb * float(steps)) / float(steps), _c0.a);',
};

/** A duck-typed TextmodeSource for sampler inputs. */
function makeTextmodeSource(): TextmodeSource {
	return {
		texture: { id: 'tex' } as unknown as WebGLTexture,
		originalWidth: 100,
		originalHeight: 100,
		width: 100,
		height: 100,
		dispose: () => {},
	} as unknown as TextmodeSource;
}

const TEXTURE_OVERLAY: TransformDefinition = {
	name: 'overlayTex',
	type: 'color',
	inputs: [{ name: 'tex', type: 'sampler2D', default: null }],
	glsl: 'vec4 sampled = texture2D(tex, _st); return vec4(mix(_c0.rgb, sampled.rgb, sampled.a), _c0.a);',
};

describe('parameter lowering through the pipeline', () => {
	const disposed: Array<{ dispose(): void }> = [];

	afterEach(() => {
		for (const registration of disposed.splice(0)) registration.dispose();
	});

	it('lowers static vector tuples into the generated shader', () => {
		disposed.push(setFunction(VECTOR_TINT, { exposeGlobal: false }));
		const shader = compileSynthSource(chainMethods(osc()).vectint([0.1, 0.2, 0.3], [0.9, 0.8, 0.7])).fragmentSource;
		expect(shader).toContain('vec4 tm_vectint(vec4 _c0, vec3 low, vec3 high)');
		expect(shader).toContain('tm_vectint(');
		expect(shader).toContain('vec3(0.1, 0.2, 0.3)');
		expect(shader).toContain('vec3(0.9, 0.8, 0.7)');
	});

	it('lowers default vector tuples without uniforms', () => {
		disposed.push(setFunction(VECTOR_TINT, { exposeGlobal: false }));
		const compiled = compileSynthSource(chainMethods(osc()).vectint());
		expect(compiled.fragmentSource).toContain('vec3(0.02, 0.04, 0.12)');
		expect(compiled.uniforms.size).toBe(0);
	});

	it('lowers dynamic vector callbacks to vecN uniforms', () => {
		disposed.push(setFunction(VECTOR_TINT, { exposeGlobal: false }));
		const compiled = compileSynthSource(
			chainMethods(osc()).vectint(
				() => [1, 0, 0],
				() => [0, 1, 0]
			)
		);
		expect(compiled.uniforms.size).toBe(2);
		expect(compiled.fragmentSource).toContain('uniform vec3');
		expect([...compiled.uniforms.values()].every((u) => u.isDynamic)).toBe(true);
	});

	it('lowers int inputs without decimal suffixes', () => {
		disposed.push(setFunction(BINNING, { exposeGlobal: false }));
		const shader = compileSynthSource(chainMethods(osc()).binning(16)).fragmentSource;
		expect(shader).toContain('vec4 tm_binning(vec4 _c0, int steps)');
		expect(shader).not.toContain('16.0');
		expect(shader).toContain('tm_binning(c0, 16)');
	});

	it('emits the Hydra compatibility aliases resolution and texture2D', () => {
		const aliasDef: TransformDefinition = {
			name: 'resWave',
			type: 'src',
			inputs: [{ name: 'freq', type: 'float', default: 4 }],
			glsl: 'vec2 st = _st * (resolution / 400.0); return vec4(vec3(sin(st.x * freq)), 1.0);',
		};
		disposed.push(setFunction(aliasDef, { exposeGlobal: false }));
		const shader = compileSynthSource(chainMethods(osc()).resWave()).fragmentSource;
		expect(shader).toContain('#define resolution u_resolution');
		expect(shader).toContain('#define texture2D texture');
		expect(shader).toContain('u_resolution');
	});

	it('rejects invalid vector arguments at compile time', () => {
		disposed.push(setFunction(VECTOR_TINT, { exposeGlobal: false }));
		expect(() => compileSynthSource(chainMethods(osc()).vectint([1, 2]))).toThrow(/exactly 3 numbers/);
	});

	it('accepts a TextmodeSource for a sampler2D input end-to-end', () => {
		disposed.push(setFunction(TEXTURE_OVERLAY, { exposeGlobal: false }));
		const media = makeTextmodeSource();

		const chain = chainMethods(osc()).overlayTex(media);
		const compiled = compileSynthSource(chain);

		// The sampler is declared and sampled with the texture2D alias.
		expect(compiled.fragmentSource).toContain('uniform sampler2D u_tms0;');
		expect(compiled.fragmentSource).toContain('uniform vec2 u_tms0_dim;');
		expect(compiled.fragmentSource).toContain('texture2D(tex, _st)');

		// The media source is available to the render pipeline for binding.
		const refs = collectTextmodeSourceRefs(chain);
		expect(refs.size).toBe(1);
		expect([...refs.values()][0]).toBe(media);
	});

	it('rejects a non-source value for a sampler2D input at chain construction', () => {
		disposed.push(setFunction(TEXTURE_OVERLAY, { exposeGlobal: false }));
		expect(() => chainMethods(osc()).overlayTex(42)).toThrow(/requires a TextmodeSource/);
	});

	it('accepts a nested SynthSource for a vec4 input', () => {
		const blendColor: TransformDefinition = {
			name: 'blendVec',
			type: 'color',
			inputs: [
				{ name: 'other', type: 'vec4', default: [0, 0, 0, 0] },
				{ name: 'amount', type: 'float', default: 0.5 },
			],
			glsl: 'return vec4(mix(_c0.rgb, other.rgb, amount), _c0.a);',
		};
		disposed.push(setFunction(blendColor, { exposeGlobal: false }));

		const nested = noise(4);
		const shader = compileSynthSource(chainMethods(osc()).blendVec(nested, 0.8)).fragmentSource;

		// The nested source compiles recursively before the color transform.
		expect(shader).toContain('vec4 tm_blendVec(vec4 _c0, vec4 other, float amount)');
		expect(shader).toContain('tm_noise(');
		expect(shader).toContain('tm_blendVec(');
	});
});

function chainMethods(source: SynthSource): SynthSource & Record<string, (...args: unknown[]) => SynthSource> {
	return source as SynthSource & Record<string, (...args: unknown[]) => SynthSource>;
}
