/**
 * @title setFunction.combine
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// A 'combine' extension mixes base pixel _c0 with argument pixel _c1.
setFunction({
	name: 'signalCut',
	type: 'combine',
	inputs: [{ name: 'edge', type: 'float', default: 0.08 }],
	glsl: `
		float cut = _luminance(_c1.rgb);
		float fill = smoothstep(0.45, 0.55, cut);
		float rim = smoothstep(0.45 - edge, 0.48, cut) - smoothstep(0.52, 0.55 + edge, cut);
		vec3 mixed = mix(_c0.rgb, _c1.rgb, fill);
		mixed += vec3(1.0, 0.82, 0.26) * clamp(rim, 0.0, 1.0);
		return vec4(mixed, 1.0);
	`,
});

const lattice = osc(30, 0.06, 0)
	.thresh(0.84, 0.05)
	.lighten(
		osc(30, 0.06, 0)
			.rotate(Math.PI / 2)
			.thresh(0.84, 0.05)
	)
	.color(0.18, 0.72, 0.98);

const windows = shape(6, 0.42, 0.05)
	.repeat(2, 2)
	.scrollX(() => Math.sin(t.frameCount * 0.014) * 0.14)
	.color(0.88, 0.36, 0.95);

const out = lattice.signalCut(windows, 0.09);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.07));

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
	t.print('SETFUNCTION.COMBINE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM SOURCE COMPOSITOR', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('type: "combine" blends _c0 and _c1', left + 3, top + 6);
	t.print('with a glowing gold cutout seam.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('lattice.signalCut(windows, 0.09)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
