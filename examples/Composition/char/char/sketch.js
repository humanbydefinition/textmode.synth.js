/**
 * @title char.char
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
	t.print('CHAR.CHAR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL GLYPH SOURCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Starts chain by choosing glyphs.', left + 3, top + 6);
	t.print('charColor and cellColor style them.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CHAR: VORONOI | INK: WARM OSC', left + 3, top + 9);
});

const cells = voronoi(4.5, 0.55, 0.35);
const ink = osc(8, 0.22, 1.2).rotate(0, 0.3).color(1.0, 0.78, 0.38);

// Start the composition from char(source), then color glyphs and cells separately.
t.synth(char(cells).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.03, 0.04, 0.09));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
