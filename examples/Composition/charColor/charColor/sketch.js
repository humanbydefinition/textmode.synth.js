/**
 * @title charColor.charColor
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const ink = osc(4.5, 0.35, 1.6)
	.rotate(0.45)
	.blend(plasma(2.4, 0.55, 0.45, 1.3).colorama(0.45), 0.5)
	.saturate(1.4)
	.contrast(1.15);
const glyphs = osc(14, 0.3, 0.2)
	.kaleid(4)
	.blend(voronoi(4.0, 0.4, 0.35), 0.4)
	.contrast(1.2);
const bg = shape(4, 0.42, 0.25).repeat(3, 3).color(0.03, 0.06, 0.14);

t.synth(charColor(ink).char(glyphs).charMap(' .:-=+*#%@').cellColor(bg));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = 37 + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CHARCOLOR.CHARCOLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL INK SOURCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('charColor(src) tints glyph ink only.', left + 3, top + 6);
	t.print('Independent dark cellColor backdrop.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Mode: charColor(src) | Ink: plasma', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
