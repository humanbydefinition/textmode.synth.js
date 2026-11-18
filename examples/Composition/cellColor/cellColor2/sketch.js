/**
 * @title cellColor.cellColor2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const rAt = (secs) => 0.22 + 0.18 * Math.sin(secs * 1.1);
const gAt = (secs) => 0.14 + 0.12 * Math.sin(secs * 1.1 + 2.1);
const bAt = (secs) => 0.34 + 0.22 * Math.sin(secs * 1.1 + 4.2);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const r = rAt(t.secs).toFixed(2);
	const g = gAt(t.secs).toFixed(2);
	const b = bAt(t.secs).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CELLCOLOR.CELLCOLOR2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL CELL RGBA', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Sets animated RGBA background paper.', left + 3, top + 6);
	t.print('Separate char() and charColor() run.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`RGBA(${r}, ${g}, ${b}, 1.0)`, left + 3, top + 9);
});

const tiles = shape(4, 0.4, 0.06).rotate(0, 0.45).repeat(3, 3);
const ink = osc(6, 0.15, 0.6).color(0.75, 1.0, 0.92).brightness(0.25);

// Top-level cellColor(r, g, b, a) drives pulsing RGBA paper behind bright rotating glyphs.
t.synth(
	cellColor(
		(ctx) => rAt(ctx.time),
		(ctx) => gAt(ctx.time),
		(ctx) => bAt(ctx.time),
		1.0
	)
		.char(tiles)
		.charMap(' .:-=+*#%@')
		.charColor(ink)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
