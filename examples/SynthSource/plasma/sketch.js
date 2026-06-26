/**
 * @title SynthSource.plasma
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

	drawText(`SYNTHSOURCE.PLASMA`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: PLASMA WAVEFIELD`, x, y++, 100, 220, 255);
	drawText(`Generates complex ripple fields.`, x, y++, 140, 160, 190);
	drawText(`Superimposes multiple sine waves.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Freq: 6 | Scale: 0.4`, x, y++, 140, 255, 180);
});

t.layers.base.synth(plasma(6, 0.4, 0.8, 1.5).kaleid([3, 6].ease('easeInOutExpo')).contrast(1.2).brightness(0.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
