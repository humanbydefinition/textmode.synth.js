/**
 * @title cellColor.cellColor3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CELLCOLOR.CELLCOLOR3', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SCALAR GRAYSCALE PAPER', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('One number sets R=G=B cell gray.', left + 3, top + 6);
	t.print('Colorful ink glyphs float on slate.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CELL GRAY: 0.22 | MOIRE GLYPHS', left + 3, top + 9);
});

const glyphs = moire(10, 13, 0.2, 0.55, 0.65, 0);
const ink = osc(7, 0.2, 1.4).rotate(0, 0.35).brightness(0.15);

// Pass a literal JS number (0.22) so cellColor() sets neutral R=G=B slate gray paper.
t.synth(cellColor(0.22).char(glyphs).charMap(' .:-=+*#%@').charColor(ink));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
