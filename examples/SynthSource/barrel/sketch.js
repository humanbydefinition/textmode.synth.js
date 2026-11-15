/**
 * @title SynthSource.barrel
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const bulge = [0.0, 2.8].fast(0.45).ease('easeInOutQuad');

// Solid CRT mosaic tiles bow outward into a convex screen bulge.
const mosaic = shape(4, 0.78, 0.04).repeat(8, 5).barrel(bulge, 0.5, 0.5);

const glyphs = mosaic.clone();

t.synth(mosaic.color(0.35, 1.0, 0.48).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.01, 0.06, 0.02));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.push();
	t.translate(left + 2 + width / 2, top + 2 + height / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.BARREL', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: OUTWARD BARREL LENS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Bends straight rows outward.', left + 3, top + 6);
	t.print('Center tiles swell like a CRT tube.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Amount: 0.0..2.8 | Center: 0.5, 0.5', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
