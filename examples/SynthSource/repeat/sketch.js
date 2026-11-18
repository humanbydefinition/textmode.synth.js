/**
 * @title SynthSource.repeat
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const counts = [3, 4, 2];
const currentCount = () => counts[Math.floor(t.secs * 0.9) % counts.length];

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const n = currentCount();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.REPEAT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: 2D BRICK TILING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Repeats space into X and Y cells.', left + 3, top + 6);
	t.print('offsetX shifts alternate rows.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`GRID: ${n}x${n} | OFFSET X: 0.50`, left + 3, top + 9);
});

const tiles = shape(4, 0.72, 0.08)
	.diff(shape(4, 0.36, 0.08))
	.add(shape(4, 0.18, 0.06))
	.rotate(0, 0.45)
	.repeat(currentCount, currentCount, 0.5, 0);

const glyphs = tiles.clone();

t.synth(tiles.color(1.0, 0.66, 0.25).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.02, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
