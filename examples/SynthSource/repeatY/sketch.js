/**
 * @title SynthSource.repeatY
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const counts = [3, 5, 2];
const currentRows = () => counts[Math.floor(t.secs * 0.9) % counts.length];

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const n = currentRows();
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.REPEATY', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VERTICAL ROW BANDS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Splits Y space into N rows.', left + 3, top + 6);
	t.print('offset shifts odd rows on X.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`ROWS: ${n} | OFFSET X: 0.30`, left + 3, top + 9);
});

const band = shape(3, 0.68, 0.08)
	.diff(shape(3, 0.32, 0.08))
	.blend(osc(8, 0.12, 0.4), 0.35)
	.scale(1, 1.4, 0.75)
	.scrollX(0, 0.24)
	.repeatY(currentRows, 0.3);

const glyphs = band.clone();

t.synth(band.color(1.0, 0.88, 0.25).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.05, 0.02, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
