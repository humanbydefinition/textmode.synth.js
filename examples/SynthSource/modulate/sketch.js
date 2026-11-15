/**
 * @title SynthSource.modulate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const amountAt = (secs) => 0.125 - 0.095 * Math.cos(secs * 1.2);

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
	t.print('SYNTHSOURCE.MODULATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: UV DISPLACEMENT WARP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Shifts XY coords by modulator RGB.', left + 3, top + 6);
	t.print('Straight grid bends into ripples.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`MODULATE AMOUNT: ${amt}`, left + 3, top + 9);
});

const bars = osc(16, 0, 0).color(0.25, 0.9, 1.0);
const cross = osc(16, 0, 0)
	.rotate(Math.PI / 2)
	.color(1.0, 0.55, 0.3);
const grid = bars.add(cross, 0.7).contrast(1.25);

// Displace straight crossed bars by moving 3D noise across amount 0.03..0.22.
const out = grid.modulate(noise(3.0, 0.35), (ctx) => amountAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
