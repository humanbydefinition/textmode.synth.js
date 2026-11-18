/**
 * @title charColor.charColor3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const glyphs = shape(6, 0.42, 0.12).repeat(3, 2).modulateRotate(osc(4, 0.25), 0.75);
const paper = plasma(2.8, 0.45, 0.3, 1.2)
	.color(0.14, 0.24, 0.42)
	.softlight(osc(8, 0.3, 1.2).color(0.35, 0.14, 0.32), 0.45);

t.synth(charColor(0.92).char(glyphs).charMap(' .:-=+*#%@').cellColor(paper));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const width = 39 + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CHARCOLOR.CHARCOLOR3', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL GRAYSCALE INK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('charColor(0.92) sets pure silver ink.', left + 3, top + 6);
	t.print('Vibrant cells & shapes move beneath.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Ink: charColor(0.92) | Cells animate', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
