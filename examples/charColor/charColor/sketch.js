/**
 * @title charColor.charColor
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add();

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

	drawText(`CHARCOLOR.CHARCOLOR`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: GLYPH CHARACTER COLOR`, x, y++, 100, 220, 255);
	drawText(`Colors glyph foregrounds only.`, x, y++, 140, 160, 190);
	drawText(`Draws a dark neutral background.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Mode: Char Color Only`, x, y++, 140, 255, 180);
});

t.layers.base.synth(charColor(osc(6, 0.1, 1.2).invert()).char(noise(6)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
