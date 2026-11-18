/**
 * @title SynthSource.char
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Concentric pulsing rings select glyphs; diagonal rainbow wave colors them.
const ringGlyphs = shape(24, 0.44, 0.04)
	.diff(shape(24, 0.28, 0.04))
	.add(shape(24, 0.14, 0.04))
	.scale((ctx) => 0.85 + 0.25 * Math.sin(ctx.time * 1.6));

const colorWave = osc(6, 0.35, 1.4)
	.rotate(0.6)
	.brightness(0.28)
	.color(1.0, 0.72, 0.35)
	.hue((ctx) => (ctx.time * 0.12) % 1);

t.synth(colorWave.char(ringGlyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.04, 0.09));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.CHAR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SOURCE-DRIVEN GLYPHS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Ring source picks each cell glyph.', left + 3, top + 6);
	t.print('Diagonal wave supplies their color.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CHAR: PULSING RINGS | INK: OSC WAVE', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
