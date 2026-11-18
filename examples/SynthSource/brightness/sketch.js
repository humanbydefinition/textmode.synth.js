/**
 * @title SynthSource.brightness
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const amountAt = (secs) => Math.sin(secs * 1.1) * 0.45;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const amt = amountAt(t.secs);
	const sign = amt >= 0 ? '+' : '-';
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.BRIGHTNESS', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: UNIFORM RGB OFFSET', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Adds amount to R, G, and B channels.', left + 3, top + 6);
	t.print('Negative dims; positive lifts tones.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`BRIGHTNESS: ${sign}${Math.abs(amt).toFixed(2)}`, left + 3, top + 9);
});

const rings = shape(4, 0.44, 0.08)
	.diff(shape(4, 0.24, 0.06))
	.repeat(2, 2)
	.color(1.0, 0.55, 0.25)
	.add(gradient(0.5).color(0.35, 0.25, 0.65), 0.5);

// Oscillate brightness from -0.45 to +0.45 over colorful diamond rings.
const out = rings.brightness((ctx) => amountAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
