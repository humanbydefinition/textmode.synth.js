/**
 * @title ModulatedArray.fast
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

	drawText(`MODULATEDARRAY.FAST`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: RELATIVE SPEEDS`, x, y++, 100, 220, 255);
	drawText(`Speeds up parameter interpolation.`, x, y++, 140, 160, 190);
	drawText(`Drives cycles at different speeds.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Speed: osc (2x) | kaleid (3x)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(osc([10, 20, 30].fast(2.0), 0.15).kaleid([3, 5, 7].fast(3.0)).color(0.2, 0.8, 0.9));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
