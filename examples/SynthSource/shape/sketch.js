/**
 * @title SynthSource.shape
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

	drawText(`SYNTHSOURCE.SHAPE`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: REGULAR POLYGON`, x, y++, 100, 220, 255);
	drawText(`Generates a regular convex shape.`, x, y++, 140, 160, 190);
	drawText(`Parameters: sides, size, and blur.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Sides: 3-6 Eased | Repeat: 3x3`, x, y++, 140, 255, 180);
});

t.layers.base.synth(
	shape([3, 6].ease('easeInOutQuad'), 0.4, 0.1)
		.repeat(3, 3)
		.rotate(t.frameCount * 0.01)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
