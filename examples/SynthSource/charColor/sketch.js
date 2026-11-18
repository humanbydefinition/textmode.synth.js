/**
 * @title SynthSource.charColor
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Wide striped hexagon rotates cleanly to carry the glyph field.
const hexBars = shape(6, 0.56, 0.05).mult(osc(12, 0.28).thresh(0.2, 0.06)).rotate(0, 0.45);
const glyphs = hexBars.clone();

// Bright, saturated multi-color wave drives foreground glyph ink.
const ink = osc(4.2, 0.35, 1.65)
	.rotate(0.45, 0.16)
	.brightness(0.28)
	.saturate(1.35)
	.hue((ctx) => (ctx.time * 0.12) % 1);

t.synth(hexBars.char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.03, 0.04, 0.09));

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
	t.print('SYNTHSOURCE.CHARCOLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SOURCE-DRIVEN INK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Colors glyphs from another source.', left + 3, top + 6);
	t.print('Hex bars keep their shape and spin.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('INK: VIVID OSC | GLYPHS: HEX BARS', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
