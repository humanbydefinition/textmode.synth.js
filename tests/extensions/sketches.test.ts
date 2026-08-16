import { describe, it, expect, afterEach } from 'vitest';
import '../../src/bootstrap';
import { setFunction } from '../../src/extensions/public';
import { gradient, moire, noise, osc, shape } from '../../src/api';
import { compileSynthSource } from '../../src/compiler/SynthCompiler';
import type { SynthSource } from '../../src/core/SynthSource';

function chainMethods(source: SynthSource): SynthSource & Record<string, (...args: unknown[]) => SynthSource> {
	return source as SynthSource & Record<string, (...args: unknown[]) => SynthSource>;
}

/**
 * Smoke tests mirror the definitions and representative chains in the
 * examples/CustomTransforms sketches so documentation art cannot drift away
 * from the compiler behavior it teaches.
 */
describe('CustomTransforms example sketches compile', () => {
	const disposed: Array<{ dispose(): void }> = [];

	afterEach(() => {
		for (const registration of disposed.splice(0)) registration.dispose();
	});

	it('setFunction.source (tideChart)', () => {
		const registration = setFunction(
			{
				name: 'tideChart',
				type: 'src',
				inputs: [
					{ name: 'frequency', type: 'float', default: 4.5 },
					{ name: 'drift', type: 'float', default: 0.3 },
				],
				glsl: `
					vec2 p = _st - vec2(0.58, 0.46);
					float swell = sin((p.x * frequency + p.y * 1.7) * 6.2831853 + time * drift);
					float echo = cos(length(p * vec2(1.0, 1.7)) * frequency * 11.0 - time * drift);
					float coast = smoothstep(0.68, 0.12, length(p * vec2(0.8, 1.25)));
					float level = floor(clamp(swell * 0.28 + echo * 0.22 + 0.5, 0.0, 1.0) * 8.0) / 7.0;
					return vec4(vec3(level * coast), 1.0);
				`,
			},
			{ exposeGlobal: false }
		);
		disposed.push(registration);
		const tideChart = registration.sources.tideChart;

		const glyphs = tideChart(4.5, 0.3).charMap(' .,:;=xX#@');
		const ink = tideChart(3, -0.12).color(0.22, 0.82, 1.15);
		const paper = tideChart(1.6, 0.04).color(0.025, 0.055, 0.11);
		expect(compileSynthSource(glyphs.charColor(ink).cellColor(paper)).fragmentSource).toContain('tm_tideChart(');
	});

	it('setFunction.coord (pleat)', () => {
		disposed.push(
			setFunction(
				{
					name: 'pleat',
					type: 'coord',
					inputs: [
						{ name: 'folds', type: 'float', default: 9 },
						{ name: 'depth', type: 'float', default: 0.24 },
					],
					glsl: `
						float column = floor(_st.x * folds);
						float local = fract(_st.x * folds) - 0.5;
						float direction = mod(column, 2.0) * 2.0 - 1.0;
						vec2 st = _st;
						st.y += direction * (0.5 - abs(local)) * depth;
						st.x += sin((_st.y + time * 0.025) * 18.0) * 0.012;
						return st;
					`,
				},
				{ exposeGlobal: false }
			)
		);

		const folds = chainMethods(moire(9, 12, 0.03, 1.57, 0.018)).pleat(9, 0.24);
		const ink = chainMethods(gradient(0.035)).pleat(9, 0.24).color(1, 0.42, 0.14);
		expect(
			compileSynthSource(folds.charMap(' ._/-|\\#@').charColor(ink).cellColor(0.045, 0.025, 0.07)).fragmentSource
		).toContain('tm_pleat(');
	});

	it('setFunction.color (printBands)', () => {
		disposed.push(
			setFunction(
				{
					name: 'printBands',
					type: 'color',
					inputs: [
						{ name: 'steps', type: 'float', default: 6 },
						{ name: 'shadow', type: 'vec3', default: [0.025, 0.04, 0.09] },
						{ name: 'paper', type: 'vec3', default: [0.82, 0.72, 0.42] },
						{ name: 'accent', type: 'vec3', default: [1, 0.16, 0.08] },
					],
					glsl: `
						float value = clamp(_luminance(_c0.rgb), 0.0, 1.0);
						float band = floor(value * steps) / max(steps - 1.0, 1.0);
						float registration = smoothstep(0.68, 0.92, fract(value * steps));
						vec3 ink = mix(shadow, paper, band);
						ink = mix(ink, accent, registration * (1.0 - band * 0.6));
						return vec4(ink, _c0.a);
					`,
				},
				{ exposeGlobal: false }
			)
		);

		const terrain = moire(5, 7, 0.08, 1.3, 0.022).add(noise(3, 0.025), 0.3);
		expect(
			compileSynthSource(chainMethods(terrain).printBands(6).charMap('  .:+=xX#@').cellColor(0.02, 0.025, 0.055))
				.fragmentSource
		).toContain('tm_printBands(');
	});

	it('setFunction.combine (signalCut)', () => {
		disposed.push(
			setFunction(
				{
					name: 'signalCut',
					type: 'combine',
					inputs: [{ name: 'edge', type: 'float', default: 0.08 }],
					glsl: `
						float key = _luminance(_c1.rgb);
						float mask = smoothstep(0.5 - edge, 0.5 + edge, key);
						float seam = 1.0 - smoothstep(0.0, edge, abs(key - 0.5));
						vec3 cut = mix(_c0.rgb, _c1.rgb, mask);
						cut = mix(cut, vec3(1.0, 0.72, 0.18), seam * 0.85);
						return vec4(cut, max(_c0.a, _c1.a));
					`,
				},
				{ exposeGlobal: false }
			)
		);

		const lattice = moire(10, 13, 0.06, 1.57, 0.018).color(0.12, 0.72, 1);
		const windows = shape(6, 0.38, 0.035).repeat(3, 2).rotate(0.3, 0.04).color(0.95, 0.16, 0.34);
		expect(
			compileSynthSource(
				chainMethods(lattice).signalCut(windows, 0.08).charMap(' .:+oxOX#@').cellColor(0.025, 0.035, 0.07)
			).fragmentSource
		).toContain('tm_signalCut(');
	});

	it('setFunction.combineCoord (fieldBend)', () => {
		disposed.push(
			setFunction(
				{
					name: 'fieldBend',
					type: 'combineCoord',
					inputs: [{ name: 'amount', type: 'float', default: 0.12 }],
					glsl: `
						vec2 flow = (_c0.rg - vec2(0.5)) * 2.0;
						vec2 ripple = vec2(
							sin((_st.y + time * 0.03) * 18.0),
							cos((_st.x - time * 0.02) * 14.0)
						);
						return _st + flow * amount + ripple * amount * 0.12;
					`,
				},
				{ exposeGlobal: false }
			)
		);

		const current = osc(2.2, 0.025, 0.9).rotate(-0.4, 0.03);
		const wire = chainMethods(moire(14, 17, 0.025, 1.57, 0.012)).fieldBend(current, 0.12);
		expect(
			compileSynthSource(
				wire
					.charMap(' ~-/\\|+x#@')
					.charColor(osc(3, 0.02, 1.2))
					.cellColor(0.015, 0.04, 0.055)
			).fragmentSource
		).toContain('tm_fieldBend(');
	});

	it('setFunction batch extension pack', () => {
		const pack = setFunction(
			[
				{
					name: 'surveyGrid',
					type: 'src',
					inputs: [
						{ name: 'rings', type: 'float', default: 9 },
						{ name: 'spokes', type: 'float', default: 7 },
					],
					glsl: 'vec2 p = (_st - 0.5) * vec2(1.25, 1.0); float radius = length(p); float angle = atan(p.y, p.x); float ring = 1.0 - smoothstep(0.035, 0.1, abs(fract(radius * rings) - 0.5)); float spoke = 1.0 - smoothstep(0.02, 0.1, abs(sin(angle * spokes))); float sweep = pow(max(0.0, cos(angle - time * 0.22)), 18.0); return vec4(vec3(max(ring * 0.8, max(spoke * 0.38, sweep))), 1.0);',
				},
				{
					name: 'scanJitter',
					type: 'coord',
					inputs: [
						{ name: 'rows', type: 'float', default: 24 },
						{ name: 'amount', type: 'float', default: 0.018 },
					],
					glsl: 'vec2 st = _st; float row = floor(st.y * rows); st.x += sin(row * 2.17 + time * 0.8) * amount; return st;',
				},
				{
					name: 'phosphorInk',
					type: 'color',
					inputs: [
						{ name: 'dark', type: 'vec3', default: [0.01, 0.05, 0.035] },
						{ name: 'glow', type: 'vec3', default: [0.2, 1, 0.5] },
						{ name: 'hot', type: 'vec3', default: [1, 0.68, 0.2] },
					],
					glsl: 'float v = clamp(_luminance(_c0.rgb), 0.0, 1.0); vec3 ink = mix(dark, glow, smoothstep(0.08, 0.72, v)); ink = mix(ink, hot, smoothstep(0.72, 0.98, v)); return vec4(ink, _c0.a);',
				},
			],
			{ exposeGlobal: false }
		);
		disposed.push(pack);

		const grid = chainMethods(pack.sources.surveyGrid(9, 7)).scanJitter(24, 0.018);
		const display = chainMethods(grid).phosphorInk();
		expect(compileSynthSource(display.charMap('  .:+*%@').cellColor(0.008, 0.025, 0.02)).fragmentSource).toContain(
			'tm_surveyGrid('
		);
	});
});
