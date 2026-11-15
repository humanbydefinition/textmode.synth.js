/**
 * @title SynthSource.contrast
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const contrastAt = (secs) => 1.15 + Math.sin(secs * 1.0) * 0.8;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const contrast = contrastAt(t.secs).toFixed(2);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CONTRAST', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: MIDTONE STRETCH', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Scales RGB distance from 0.5 gray.', left + 3, top + 6);
	t.print('< 1 flattens; > 1 sharpens edges.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CONTRAST: ${contrast}`, left + 3, top + 9);
});

const base = osc(7, 0.14, 0.9).blend(osc(5, -0.1, 1.3).rotate(1.1), 0.5);

// Sweep contrast across 0.35..1.95 so intersecting waves flatten to haze then snap sharp.
const out = base.contrast((ctx) => contrastAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
