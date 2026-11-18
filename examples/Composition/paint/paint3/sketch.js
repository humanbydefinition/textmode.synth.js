/**
 * @title paint.paint3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const glyphs = voronoi(4.5, 0.45, 0.35)
	.blend(shape(8, 0.42, 0.12).repeat(2, 2), 0.45)
	.contrast(1.25);

t.synth(paint(0.9).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.14));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const width = 39 + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('PAINT.PAINT3', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL GRAYSCALE PAINT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('paint(0.9) fills both channels gray.', left + 3, top + 6);
	t.print('Darker cellColor(0.14) adds contrast.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Paint: paint(0.9) | Bg: cellColor(0.14)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
