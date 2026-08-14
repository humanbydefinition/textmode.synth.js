/**
 * @title createSynthRuntime
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add();

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('CREATE SYNTH RUNTIME', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: ISOLATED CATALOG', x, y++, 100, 220, 255);
	drawText('Sources stay inside this runtime.', x, y++, 140, 160, 190);
	drawText('Built-ins remain available there.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('archiveSignal().diff(localNoise)', x, y++, 140, 255, 180);
});

const synth = createSynthRuntime({
	name: 'archive-terminal',
	transforms: [
		{
			name: 'archiveSignal',
			type: 'src',
			inputs: [
				{ name: 'frequency', type: 'float', default: 11 },
				{ name: 'drift', type: 'float', default: 0.15 },
			],
			glsl: `vec2 p = (_st - 0.5) * vec2(1.35, 1.0); float ring = sin(length(p) * frequency * 6.2831853 - time * drift) * 0.5 + 0.5; float bars = sin((p.x * 3.0 - p.y) * 18.0 + time * drift) * 0.5 + 0.5; float aperture = smoothstep(0.58, 0.18, length(p)); return vec4(vec3((ring * 0.68 + bars * 0.32) * aperture), 1.0);`,
		},
		{
			name: 'oxideInk',
			type: 'color',
			inputs: [],
			glsl: 'float v = clamp(_luminance(_c0.rgb), 0.0, 1.0); vec3 rust = mix(vec3(0.03, 0.06, 0.08), vec3(0.95, 0.34, 0.1), v); rust = mix(rust, vec3(0.6, 0.95, 0.82), smoothstep(0.78, 1.0, v)); return vec4(rust, _c0.a);',
		},
	],
	exposeGlobal: false,
});

const { archiveSignal, noise: localNoise } = synth.sources;
const transmission = archiveSignal(11, 0.15).diff(localNoise(3, 0.025)).oxideInk();

t.synth(transmission.charMap('  .,:;=xX#@').cellColor(0.025, 0.03, 0.045));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
