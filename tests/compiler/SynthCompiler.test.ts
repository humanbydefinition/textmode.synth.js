import { describe, expect, it } from 'vitest';
import '../../src/bootstrap';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import { plasma } from '../../src/api';

describe('SynthCompiler', () => {
	it('prefixes transform GLSL functions that collide with built-ins', () => {
		const compiled = compileSynthSource(plasma(6, 0.1).clamp(0.18, 0.74));

		expect(compiled.fragmentSource).toContain('vec4 tm_clamp(vec4 _c0, float tm_min, float tm_max)');
		expect(compiled.fragmentSource).toContain('tm_clamp(');
		expect(compiled.fragmentSource).not.toContain('vec4 clamp(');
		expect(compiled.fragmentSource).not.toContain('float min');
		expect(compiled.fragmentSource).not.toContain('float max');
		expect(compiled.fragmentSource).toContain('vec3(tm_min)');
		expect(compiled.fragmentSource).toContain('vec3(tm_max)');
	});
});
