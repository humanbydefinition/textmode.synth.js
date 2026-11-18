/**
 * @title SynthSource.saturate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const satAt = (secs) => 1.2 - 1.2 * Math.cos(secs * 1.0);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const sat = satAt(t.secs).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SATURATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CHROMA INTENSITY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('0.0 drains color to grayscale luma.', left + 3, top + 6);
	t.print('> 1.0 boosts vivid neon color.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SATURATE: ${sat}`, left + 3, top + 9);
});

const field = osc(9, 0.16, 1.5).blend(gradient(0.7).rotate(0, 0.2), 0.45);

// Sweep saturation 0..2.4 so luminance stays steady while color drains to gray and floods back.
const out = field.saturate((ctx) => satAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
