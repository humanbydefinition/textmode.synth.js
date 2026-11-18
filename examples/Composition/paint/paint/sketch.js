/**
 * @title paint.paint
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
	t.print('PAINT.PAINT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL PAINT SOURCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('paint(src) sets both ink and paper.', left + 3, top + 6);
	t.print('Dimmed cellColor reveals hex glyphs.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('PAINT: OSC+PLASMA | BG: 0.22x', left + 3, top + 9);
});

const palette = osc(10, 0.22, 1.5)
	.rotate(0.5, 0.2)
	.blend(plasma(4, 0.5, 0, 1.1).color(0.3, 0.9, 1.0), 0.4);
const glyphPattern = shape(6, 0.42, 0.06)
	.diff(shape(6, 0.2, 0.05))
	.rotate(0, -0.4)
	.repeat(3, 3);

// paint(src) fills both channels identically; a dimmed cellColor override reveals the glyphs.
t.synth(paint(palette).char(glyphPattern).charMap(' .:-=+*#%@').cellColor(palette.clone().color(0.22)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
