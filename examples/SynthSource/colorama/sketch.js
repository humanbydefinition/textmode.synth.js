/**
 * @title SynthSource.colorama
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const amountAt = (secs) => 0.25 - 0.2 * Math.cos(secs * 0.9);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const amt = amountAt(t.secs).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.COLORAMA', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CYCLIC HSV WRAP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Offsets HSV and wraps RGB via fract.', left + 3, top + 6);
	t.print('Overflow carves rainbow contours.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`COLORAMA: ${amt}`, left + 3, top + 9);
});

// Offset HSV and wrap RGB with fract() so smooth plasma lobes erupt into rainbow contour fringes.
const out = plasma(5, 0.4, 0, 1.0)
	.color(0.95, 0.5, 0.35)
	.colorama((ctx) => amountAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
