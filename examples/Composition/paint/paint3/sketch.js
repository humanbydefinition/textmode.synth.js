/**
 * @title paint.paint3
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

	drawText('PAINT.PAINT3', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('TOP LEVEL PAINT TEXTURE', x, y++, 120, 220, 255);
	drawText('paint(source) fills both layers.', x, y++, 160, 180, 210);
	drawText('char(source) sculpts glyphs.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('No separate color-channel methods.', x, y++, 150, 255, 190);
});

const paintField = plasma(3.8, 0.02, 0.3, 1.14)
	.colorama(0.12)
	.softlight(osc(10, 0.012, 0.7).color(1.0, 0.55, 0.32), 0.28);
const glyphField = noise(4.5, 0.018)
	.modulateKaleid(osc(2.6, 0.008), 5)
	.levels(0.18, 0.86, 0.05, 1.0, 0.82)
	.contrast(1.12);

t.layers.base.synth(paint(paintField).char(glyphField).charMap(glyphs));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
