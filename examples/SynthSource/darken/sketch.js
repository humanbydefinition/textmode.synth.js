/**
 * @title SynthSource.darken
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const mixAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.1);

// Keep both waves bright (0.35..0.98) so per-channel min yields jewel midtones.
const goldWave = osc(10, -0.14)
	.rotate(Math.PI / 3)
	.levels(0.0, 1.0, 0.35, 0.98)
	.color(1.0, 0.72, 0.38);

const out = osc(10, 0.12)
	.levels(0.0, 1.0, 0.35, 0.98)
	.color(0.45, 0.92, 1.0)
	.darken(goldWave, ({ time }) => mixAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.05));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + (width - 1) / 2, top + 2 + (height - 1) / 2);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.DARKEN', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PER-CHANNEL MINIMUM', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Keeps the darker RGB channel.', left + 3, top + 6);
	t.print('Gold wave carves jewel-tone shadows.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`Amount: ${mixAt(t.secs).toFixed(2)} | Min(sky, warm gold)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
