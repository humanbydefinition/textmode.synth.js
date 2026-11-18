/**
 * @title SynthSource.lighten
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const mixAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.1);

const ring = shape(6, 0.44, 0.08)
	.diff(shape(6, 0.22, 0.08))
	.rotate(0, 0.4)
	.color(0.98, 0.28, 0.68);

// Lighten keeps the brighter RGB channel everywhere, merging coral and emerald.
const out = osc(12, 0.12)
	.rotate(Math.PI / 2)
	.color(0.15, 0.95, 0.55)
	.lighten(ring, ({ time }) => mixAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.04));

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
	t.print('SYNTHSOURCE.LIGHTEN', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PER-CHANNEL MAXIMUM', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Keeps the brighter RGB channel.', left + 3, top + 6);
	t.print('Coral hex ring floats over emerald.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`Amount: ${mixAt(t.secs).toFixed(2)} | Max(emerald, coral)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
