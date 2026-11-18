/**
 * @title SynthSource.modulateScale
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const multAt = (secs) => 0.65 - 0.5 * Math.cos(secs * 1.2);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const mult = multAt(t.secs).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATESCALE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: LOCAL ZOOM FIELD', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Scales UVs around center by source.', left + 3, top + 6);
	t.print('Bright zones magnify tiled hexes.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SCALE MULT: ${mult} | OFF 0.85`, left + 3, top + 9);
});

const tiles = shape(6, 0.44, 0.08)
	.color(0.25, 0.95, 0.72)
	.add(shape(6, 0.2, 0.05).color(0.95, 0.85, 0.25), 0.7)
	.repeat(3, 3);

// Breathe local magnification across a 3x3 filled hex grid using a moving plasma modulator.
const out = tiles.modulateScale(plasma(3.5, 0.65, 0, 1.0), (ctx) => multAt(ctx.time), 0.85);
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.06));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
