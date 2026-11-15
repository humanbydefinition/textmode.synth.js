/**
 * @title SynthSource.invert
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const amountAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.45);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const amt = amountAt(t.secs).toFixed(2);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.INVERT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: COLOR COMPLEMENT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Blends each channel toward 1 - RGB.', left + 3, top + 6);
	t.print('0.5 flattens; 1.0 flips dark/light.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`INVERT AMOUNT: ${amt}`, left + 3, top + 9);
});

const backdrop = voronoi(4, 0.25, 0.45).color(0.75, 0.22, 0.18);
const emblem = shape(6, 0.36, 0.04).rotate(0, 0.35).color(0.25, 0.95, 0.95);

// Smoothly flip between glowing cyan emblem on dark coral and dark cutout on bright sky.
const out = backdrop.add(emblem, 0.9).invert((ctx) => amountAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
