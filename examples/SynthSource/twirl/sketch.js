/**
 * @title SynthSource.twirl
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const amount = [-4.5, 4.5].fast(0.4).ease('easeInOutCubic');

// Build a crisp crosshatch so the bounded twist radius stands out clearly.
const grid = osc(38, 0, 0)
	.thresh(0.86, 0.04)
	.lighten(
		osc(38, 0, 0)
			.rotate(Math.PI / 2)
			.thresh(0.86, 0.04)
	)
	.twirl(amount, 0.36, 0.5, 0.5);

const glyphs = grid.clone();

t.synth(grid.color(0.25, 0.98, 0.82).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.05, 0.08));

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
	t.print('SYNTHSOURCE.TWIRL', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: BOUNDED CORE VORTEX', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Twists coordinates inside a radius.', left + 3, top + 6);
	t.print('Grid outside radius stays straight.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Amount: -4.5..4.5 | Radius: 0.36', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
