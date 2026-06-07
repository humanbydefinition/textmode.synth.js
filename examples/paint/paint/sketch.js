/**
 * @title paint.paint
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

	drawText('PAINT.PAINT', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COMPOSITE PAINT SOURCE', x, y++, 100, 220, 255);
	drawText('Paints cells and glyphs from source.', x, y++, 140, 160, 190);
	drawText('Feeds single pattern to all channels.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Source: osc color | Char: noise', x, y++, 140, 255, 180);
});

t.layers.base.synth(paint(osc(10, 0.1).color(0.2, 0.8, 0.9)).char(noise(8, 0.15)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
