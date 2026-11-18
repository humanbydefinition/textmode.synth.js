/**
 * @title SynthSource.plasma
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const contrastAt = (secs) => 1.1 + Math.sin(secs * 0.9) * 0.35;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const contrast = contrastAt(t.secs).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.PLASMA', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: MULTI-SINE INTERFERENCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Sums X, Y, and diagonal waves.', left + 3, top + 6);
	t.print('contrast sharpens peaks and valleys.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SCALE 8 | SPD 0.65 | CONTRAST ${contrast}`, left + 3, top + 9);
});

// Three interfering sine waves tinted magenta-gold; oscillating contrast sharpens the lobes.
const waves = plasma(8, 0.65, 0, (ctx) => contrastAt(ctx.time));
const glyphs = waves.clone();

t.synth(
	waves
		.color(1.0, 0.38, 0.82)
		.hue((ctx) => Math.sin(ctx.time * 0.35) * 0.14)
		.char(glyphs)
		.cellColor(0.04, 0.01, 0.06)
		.charMap(' .:-=+*#%@')
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
