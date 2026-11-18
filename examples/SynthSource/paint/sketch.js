/**
 * @title SynthSource.paint
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const palette = plasma(2.0, 0.5, 0.4, 1.3).colorama(0.55).saturate(1.3).brightness(0.18);
const glyphs = shape(6, 0.54, 0.08)
	.rotate(() => t.secs * 0.35)
	.repeat(3, 2);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').paint(palette).cellColor(palette.clone().color(0.22)));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.PAINT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PAINT BOTH CHANNELS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('paint(src) sets char + cell color.', left + 3, top + 6);
	t.print('Dim cellColor(0.22x) keeps glyphs.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('MODE: PAINT(PLASMA) + 0.22X BG', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
