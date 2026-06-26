/**
 * @title SynthSource.repeatX
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

	drawText(`SYNTHSOURCE.REPEATX`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: HORIZONTAL TILING`, x, y++, 100, 220, 255);
	drawText(`Repeats space on the horizontal axis.`, x, y++, 140, 160, 190);
	drawText(`Creates repeating columns of shape.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Repeat X: Eased (2 to 6)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(shape(4, 0.2, 0.05).repeatX([2, 6].ease('easeInOutCubic')).color(0.2, 0.8, 0.8));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
