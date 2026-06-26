/**
 * @title paint.paint2
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

	drawText('PAINT.PAINT2', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('TOP LEVEL PAINT SOURCE', x, y++, 120, 220, 255);
	drawText('paint(source) owns colors.', x, y++, 160, 180, 210);
	drawText('char(source) chooses glyphs.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('No separate color-channel methods.', x, y++, 150, 255, 190);
});

const paintField = osc(7, 0.016, 1.4)
	.kaleid(6)
	.color(0.28, 0.76, 1.0)
	.modulate(plasma(2.6, 0.014, 0.1, 1.1), 0.025);
const glyphField = osc(9, 0.018, 1.2).kaleid(5).modulate(noise(2.2, 0.012), 0.018).levels(0.18, 0.88, 0.04, 1.0, 0.9);

t.layers.base.synth(paint(paintField).char(glyphField).charMap(glyphs));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
