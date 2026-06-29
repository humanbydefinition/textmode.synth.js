/**
 * @title SynthSource.pinch
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

	drawText(`SYNTHSOURCE.PINCH`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: PINCH LENS WARP`, x, y++, 100, 220, 255);
	drawText(`Applies concave pinch squeeze.`, x, y++, 140, 160, 190);
	drawText(`Draws coordinates inward.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Lens: Eased (-0.5 to 0.8)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(noise(6).pinch([-0.5, 0.8].ease('easeInOutSine')).color(0.1, 0.7, 0.9));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
