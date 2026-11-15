/**
 * @title SynthSource.scroll
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Tiled diamond-and-square quilt wraps seamlessly as both axes scroll.
const diamonds = shape(4, 0.48, 0.03).rotate(0.7854).repeat(4, 4, 0.5).color(1.0, 0.45, 0.25);
const squares = shape(4, 0.34, 0.03).repeat(4, 4).color(0.2, 0.85, 0.95);
const quilt = diamonds.diff(squares).scroll(0, 0, 0.22, 0.16);

t.synth(quilt.char(quilt.clone()).charMap(' .:+*#%@').cellColor(0.04, 0.04, 0.08));

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SCROLL', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: 2D COORDINATE SCROLL', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Shifts both X and Y coordinates.', left + 3, top + 6);
	t.print('Wraps seamlessly across tile edges.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('SPEED X: +0.22/S | SPEED Y: +0.16/S', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
