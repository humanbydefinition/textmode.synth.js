/**
 * @title SynthSource.modulatePixelate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const multAt = (secs) => 9 - 5 * Math.cos(secs * 1.1);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const mult = multAt(t.secs).toFixed(1);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEPIXELATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VARIABLE MOSAIC GRID', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Source sets cell count per region.', left + 3, top + 6);
	t.print('Dark zones stay chunky; bright fine.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`MULT: ${mult} | OFFSET: 4`, left + 3, top + 9);
});

const pattern = osc(10, 0.18, 1.2).rotate(0.45).blend(gradient(0.8), 0.35);

// Quantize a rainbow wave into variable block sizes (4..18) driven by plasma brightness.
const out = pattern.modulatePixelate(plasma(3.5, 0.6, 0, 1.3), (ctx) => multAt(ctx.time), 4);
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
