/**
 * @title SynthSource.charColor3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Kaleidoscopic wave drives glyph density; 1-arg charColor() sets gray ink.
const pattern = osc(7, 0.35).kaleid(5);
const glyphs = pattern.clone();
const paper = plasma(3.8, 0.45).color(0.08, 0.24, 0.52);

t.synth(pattern.char(glyphs).charMap(' .:-=+*#%@').charColor(0.88).cellColor(paper));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CHARCOLOR3', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: GRAYSCALE FOREGROUND INK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('One scalar sets monochrome gray ink.', left + 3, top + 6);
	t.print('Colored paper moves behind glyphs.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('INK: 0.88 GRAY | PAPER: BLUE PLASMA', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
