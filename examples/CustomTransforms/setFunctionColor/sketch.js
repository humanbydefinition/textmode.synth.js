/**
 * @title setFunction.color
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// A 'color' extension receives upstream pixel _c0 and remaps its RGBA value.
setFunction({
	name: 'printBands',
	type: 'color',
	inputs: [
		{ name: 'steps', type: 'float', default: 5 },
		{ name: 'shift', type: 'float', default: 0 },
	],
	glsl: `
		float lum = fract(_luminance(_c0.rgb) + shift);
		float q = floor(lum * steps) / max(steps - 1.0, 1.0);
		float edge = 1.0 - smoothstep(0.0, 0.12, abs(fract(lum * steps) - 0.5));
		vec3 base = mix(vec3(0.08, 0.06, 0.22), vec3(0.95, 0.34, 0.42), q);
		vec3 ink = mix(base, vec3(1.0, 0.92, 0.62), smoothstep(0.65, 1.0, q));
		ink = mix(ink, vec3(0.04, 0.03, 0.12), edge * 0.65);
		return vec4(ink, _c0.a);
	`,
});

const banded = plasma(2.2, 0.6, 0.9)
	.add(moire(0.3, 8, 0.35), 0.3)
	.printBands(5, () => t.frameCount * 0.004);

const glyphs = banded.clone();

t.synth(banded.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.025, 0.02, 0.06));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + (width - 1) / 2, top + 2 + (height - 1) / 2);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SETFUNCTION.COLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM COLOR GRADING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('type: "color" quantizes _c0 into', left + 3, top + 6);
	t.print('stepped risograph ink plateaus.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('printBands(5, scrolling)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
