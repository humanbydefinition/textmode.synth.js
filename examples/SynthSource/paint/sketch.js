/**
 * @title SynthSource.paint
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

	drawText('SYNTHSOURCE.PAINT', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COMPOSITE PAINT METHOD', x, y++, 100, 220, 255);
	drawText('Paints cells and glyphs from source.', x, y++, 140, 160, 190);
	drawText('Uses separate plasma source values.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Char & Cell: plasma | Base: osc', x, y++, 140, 255, 180);
});

t.layers.base.synth(osc(8, 0.1).paint(plasma(6, 0.3).colorama(0.1)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
