/**
 * @title SynthSource.modulateKaleid
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const sides = [4, 5, 6, 7];
const sidesAt = (secs) => sides[Math.floor(secs * 0.65) % sides.length];

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const nSides = sidesAt(t.secs);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEKALEID', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: WARPED KALEIDOSCOPE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Folds into wedges; source warps R.', left + 3, top + 6);
	t.print('Petals ripple as modulator flows.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SIDES: ${nSides} | MOD: PLASMA`, left + 3, top + 9);
});

const motif = osc(12, 0.18, 0.8)
	.color(0.25, 0.85, 1.0)
	.add(shape(3, 0.34, 0.05).scroll(0.2, 0.15).color(1.0, 0.4, 0.7), 0.7);

// Fold into 4..7 wedges while plasma shifts radial sampling distance (_c0.r + r).
const out = motif.modulateKaleid(plasma(3.5, 0.75, 0, 1.0), (ctx) => sidesAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
