/**
 * @title SynthSource.hardlight
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const mixAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.1);

const beam = osc(6, 0.18).rotate(0, 0.25).color(0.35, 0.85, 1.0);

// Hardlight tests the blend source at 0.5 to carve crisp contrast bands.
const out = moire(10, 13, 0.2, 1.7, 0.2)
	.color(0.88, 0.52, 0.26)
	.hardlight(beam, ({ time }) => mixAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.02, 0.02));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.push();
	t.translate(left + 2 + width / 2, top + 2 + height / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.HARDLIGHT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: HARD CONTRAST SPOTLIGHT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Source splits blend at 0.5 threshold', left + 3, top + 6);
	t.print('Carves crisp light and shadow bands.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`Amount: ${mixAt(t.secs).toFixed(2)} | Rotating cyan beam`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
