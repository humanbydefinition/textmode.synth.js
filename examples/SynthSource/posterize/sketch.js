/**
 * @title SynthSource.posterize
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const binSteps = [4, 2, 6, 3];

const base = osc(4.5, 0.25, 1.8)
	.rotate(0.5)
	.blend(plasma(3.0, 0.45).color(1.0, 0.55, 0.9), 0.45)
	.brightness(0.08)
	.contrast(1.25);
const out = base.posterize(binSteps.fast(0.95), 0.75);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.07));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const step = Math.floor(t.secs * 0.95) % binSteps.length;
	const status = `Bins: ${binSteps[step]} | Gamma: 0.75`;
	const width = Math.max(36, [...status].length) + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.POSTERIZE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: COLOR POSTERIZATION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Quantizes tones into discrete bins.', left + 3, top + 6);
	t.print('Fewer bins create sharper bands.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(status, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
