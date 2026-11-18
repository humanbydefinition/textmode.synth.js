/**
 * @title SynthSource.pinch
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const squeeze = [0.0, 4.8].fast(0.45).ease('sin');

// Rotate squares into a diamond lattice so inward pincushion curvature reads clearly.
const diamonds = shape(4, 0.62, 0.04)
	.rotate(Math.PI / 4)
	.repeat(9, 6)
	.pinch(squeeze, 0.5, 0.5);

const glyphs = diamonds.clone();

t.synth(diamonds.color(0.98, 0.35, 0.88).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.06, 0.02, 0.07));

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
	t.print('SYNTHSOURCE.PINCH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: INWARD PINCH SQUEEZE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Pulls outer grid lines inward.', left + 3, top + 6);
	t.print('Forms a concave pincushion waist.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Amount: 0.0..4.8 | Center: 0.5, 0.5', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
