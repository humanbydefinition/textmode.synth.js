/**
 * @title SynthSource.dodge
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const mixAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.15);

const flare = osc(10, 0.16, 0.4).kaleid(4).color(0.35, 0.72, 0.92);

// Color dodge divides the base by (1 - source), igniting bright overlap ridges.
const out = plasma(4.5, 0.3, 0.0, 1.0)
	.color(0.18, 0.65, 0.58)
	.dodge(flare, ({ time }) => mixAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.01, 0.04, 0.04));

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
	t.print('SYNTHSOURCE.DODGE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: COLOR DODGE BLOOM', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Divides base by inverse of source.', left + 3, top + 6);
	t.print('Overlapping ridges ignite to white.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`Amount: ${mixAt(t.secs).toFixed(2)} | Cyan kaleid dodge`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
