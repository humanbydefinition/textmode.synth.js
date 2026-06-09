/**
 * @title ModulatedArray.smooth
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

	drawText(`MODULATEDARRAY.SMOOTH`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: SMOOTH FILTERING`, x, y++, 100, 220, 255);
	drawText(`Applies filter to array inputs.`, x, y++, 140, 160, 190);
	drawText(`Softens high frequency jumps.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Smoothing Coefficient: 0.95`, x, y++, 140, 255, 180);
});

t.layers.base.synth(shape(4).rotate([0, 1.5, 3.14].smooth(0.95)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
