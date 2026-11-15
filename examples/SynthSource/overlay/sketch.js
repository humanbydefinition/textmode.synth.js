/**
 * @title SynthSource.overlay
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const mixAt = (secs) => 0.5 - 0.5 * Math.cos(secs * 1.1);

const stripes = osc(14, 0.18, 0.8).rotate(0.55).color(1.0, 0.38, 0.68);

// Overlay deepens base shadows (< 0.5) and brightens base highlights (> 0.5).
const out = shape(4, 0.55, 0.32)
	.repeat(3, 2)
	.color(0.76, 0.88, 1.0)
	.overlay(stripes, ({ time }) => mixAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.02, 0.06));

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
	t.print('SYNTHSOURCE.OVERLAY', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CONTRAST SPLIT OVERLAY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Base < 0.5 darkens, > 0.5 brightens.', left + 3, top + 6);
	t.print('Midtones reveal tinted wave bands.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`Amount: ${mixAt(t.secs).toFixed(2)} | Base splits at 0.5`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
