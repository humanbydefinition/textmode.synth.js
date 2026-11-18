/**
 * @title SynthSource.cellColor
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const paper = plasma(2.2, 0.45, 0.4, 1.25).colorama(0.42).color(0.42);
const glyphs = shape(4, 0.58, 0.08)
	.rotate(() => t.secs * 0.35)
	.repeat(4, 3);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(0.95, 0.98, 1).cellColor(paper));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CELLCOLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SOURCE CELL PAPER', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Drives cell bg with a SynthSource.', left + 3, top + 6);
	t.print('Bright glyphs stay crisp on top.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('BG: PLASMA(2.2,0.45)->.CELLCOLOR()', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
