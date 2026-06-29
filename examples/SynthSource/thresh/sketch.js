/**
 * @title SynthSource.thresh
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

	drawText(`SYNTHSOURCE.THRESH`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: THRESHOLD FILTER`, x, y++, 100, 220, 255);
	drawText(`Binarizes canvas to black/white.`, x, y++, 140, 160, 190);
	drawText(`Splits values at pivot point.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Pivot: Eased (0.3 to 0.7)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(noise(6).thresh([0.3, 0.7].ease('easeInOutSine')));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
