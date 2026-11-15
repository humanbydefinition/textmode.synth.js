/**
 * @title SynthSource.cellColor3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const glyphs = osc(6, 0.35, 1.2).add(osc(4, -0.28, 0.6), 0.5);
const ink = plasma(4, 0.45, 0.4).colorama(0.25).brightness(0.18);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.22));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CELLCOLOR3', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: GRAYSCALE CELL PAPER', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('One scalar sets R=G=B cell gray.', left + 3, top + 6);
	t.print('Colorful glyphs over neutral bg.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CELLCOLOR GRAY: 0.22 (R=G=B)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
