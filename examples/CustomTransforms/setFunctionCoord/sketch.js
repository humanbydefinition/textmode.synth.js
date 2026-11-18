/**
 * @title setFunction.coord
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// A 'coord' extension transforms _st before sampling the upstream pattern.
setFunction({
	name: 'pleatFold',
	type: 'coord',
	inputs: [
		{ name: 'folds', type: 'float', default: 8 },
		{ name: 'depth', type: 'float', default: 0.16 },
	],
	glsl: `
		vec2 st = _st;
		float phase = st.x * folds + time * 0.25;
		float ridge = abs(fract(phase) * 2.0 - 1.0) - 0.5;
		st.y += ridge * depth;
		st.x += sin(phase * 6.28318) * (depth * 0.22);
		return st;
	`,
});

const depth = () => 0.12 + 0.08 * Math.sin(t.frameCount * 0.025);

const grid = osc(36, 0, 0)
	.thresh(0.84, 0.04)
	.lighten(
		osc(36, 0, 0)
			.rotate(Math.PI / 2)
			.thresh(0.84, 0.04)
	)
	.pleatFold(8, depth);

const glyphs = grid.clone();

t.synth(grid.color(0.28, 0.92, 1.0).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.09));

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
	t.print('SETFUNCTION.COORD', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM COORDINATE WARP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('type: "coord" bends _st into', left + 3, top + 6);
	t.print('accordion pleats across the grid.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('pleatFold(8, 0.04..0.20)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
