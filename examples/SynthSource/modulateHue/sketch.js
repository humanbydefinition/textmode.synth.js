/**
 * @title SynthSource.modulateHue
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const amountAt = (secs) => 12 - 6 * Math.cos(secs * 1.2);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const amt = amountAt(t.secs).toFixed(1);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEHUE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RGB-DELTA SHEAR', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Shifts UVs by (G-R, B-G) / res.', left + 3, top + 6);
	t.print('Large amount shears across cells.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`AMOUNT: ${amt} CELLS`, left + 3, top + 9);
});

const lattice = shape(4, 0.44, 0.05)
	.diff(shape(4, 0.2, 0.04))
	.repeat(3, 3)
	.color(0.95, 0.72, 1.0);
const chroma = osc(3, 0.22, 2.0).rotate(0, 0.25);

// Use large cell-scale amount (6..18) to shear the bold 3x3 square grid along RGB deltas.
const out = lattice.modulateHue(chroma, (ctx) => amountAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.02, 0.06));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
