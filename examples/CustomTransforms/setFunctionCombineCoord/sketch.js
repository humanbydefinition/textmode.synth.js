/**
 * @title setFunction.combineCoord
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// A 'combineCoord' extension warps _st using modulator pixel _c0.
setFunction({
	name: 'fieldBend',
	type: 'combineCoord',
	inputs: [{ name: 'amount', type: 'float', default: 0.09 }],
	glsl: `
		float angle = _luminance(_c0.rgb) * 6.28318 + time * 0.25;
		return _st + vec2(cos(angle), sin(angle)) * amount;
	`,
});

const flow = plasma(1.8, 0.55, 0.95);
const amount = () => 0.06 + 0.05 * Math.sin(t.frameCount * 0.02);

const grid = osc(36, 0, 0)
	.thresh(0.85, 0.04)
	.lighten(
		osc(36, 0, 0)
			.rotate(Math.PI / 2)
			.thresh(0.85, 0.04)
	)
	.fieldBend(flow, amount);

const glyphs = grid.clone();

t.synth(grid.color(0.32, 0.96, 0.68).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.015, 0.05, 0.04));

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
	t.print('SETFUNCTION.COMBINECOORD', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM MODULATOR WARP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('type: "combineCoord" displaces _st', left + 3, top + 6);
	t.print('along vectors driven by _c0 luma.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('grid.fieldBend(flow, 0.01..0.11)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
