/**
 * @title cellColor.cellColor
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
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CELLCOLOR.CELLCOLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL CELL SOURCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Starts a chain with cell background.', left + 3, top + 6);
	t.print('Chains char() and charColor() above.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CELL: PLASMA | CHAR: OSC WAVE', left + 3, top + 9);
});

// Keep the jewel-toned plasma background dark (~0.4) so bright cream glyphs stay legible.
const paper = plasma(4, 0.45, 0.2, 1.1)
	.color(0.36, 0.14, 0.52)
	.hue((ctx) => Math.sin(ctx.time * 0.4) * 0.15);
const wave = osc(12, 0.18, 0.4).rotate(0, 0.3);

t.synth(cellColor(paper).char(wave).charMap(' .:-=+*#%@').charColor(1.0, 0.92, 0.65));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
