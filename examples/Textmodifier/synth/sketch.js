/**
 * @title Textmodifier.synth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const rosette = shape(8, 0.5, 0.05)
	.diff(shape(8, 0.28, 0.05))
	.add(shape(4, 0.16, 0.04).rotate(0, -0.45))
	.rotate(0, 0.32);
const glyphs = rosette.clone();
const ink = osc(4.2, 0.35, 1.5).rotate(0.4, 0.15).brightness(0.25).saturate(1.35);
const paper = shape(8, 0.58, 0.12)
	.color(0.04, 0.08, 0.2)
	.add(solid(0.01, 0.02, 0.06));

t.synth(rosette.char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(paper));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(39, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('TEXTMODIFIER.SYNTH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ROOT SYNTH SHORTCUT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('t.synth() binds to the base layer.', left + 3, top + 6);
	t.print('Char, ink, and paper compose cleanly.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('t.synth(rosetteSource)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
