/**
 * @title SynthSource.luma
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const thresholdAt = (secs) => 0.38 + 0.18 * Math.sin(secs * 1.2);

const backdrop = osc(8, 0.12, 0.2)
	.rotate(Math.PI / 2)
	.color(0.18, 0.52, 0.95);
const keyed = plasma(3.2, 0.55, 0.0, 1.3)
	.color(1.0, 0.85, 0.35)
	.luma(({ time }) => thresholdAt(time), 0.12);

const out = backdrop.layer(keyed);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.09));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const status = `Threshold: ${thresholdAt(t.secs).toFixed(2)} | Tol: 0.12`;
	const width = Math.max(36, [...status].length) + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.LUMA', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: LUMINANCE ALPHA KEY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Turns brightness into cutout alpha.', left + 3, top + 6);
	t.print('Dim coral areas reveal blue bars.', left + 3, top + 7);
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
