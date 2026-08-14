/**
 * @title Textmodifier.synth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .:-=+*#%@';

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('TEXTMODIFIER.SYNTH', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('BASE-LAYER SYNTH SHORTCUT', x, y++, 120, 220, 255);
	drawText('t.synth routes to the base layer.', x, y++, 160, 180, 210);
	drawText('It still receives all three fields.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('t.synth(threeTargetSource)', x, y++, 150, 255, 190);
});

const glyphField = plasma(5.5, 0.02, 0.3, 1.2)
	.modulate(moire(7, 10, 0.12, 1.5, 0.014), 0.08)
	.kaleid(5);
const inkField = osc(6, 0.018, 1.2)
	.rotate(0.25, 0.006)
	.color(0.9, 0.3, 1.0)
	.screen(moire(10, 14, 0.1, 1.55, 0.016).color(0.18, 0.82, 1.0), 0.34);
const paperField = plasma(3.2, 0.015, 0.7, 1.04)
	.brightness(0.2)
	.color(0.12, 0.04, 0.2)
	.softlight(noise(2.0, 0.012), 0.24);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
