/**
 * @title ModulatedArray.fit
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

	drawText('MODULATEDARRAY.FIT', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: RANGE FITTING', x, y++, 100, 220, 255);
	drawText('Fits cycling inputs to new bounds.', x, y++, 140, 160, 190);
	drawText('Scales values to custom ranges.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Fit: Rotation & Scale dynamic bounds', x, y++, 140, 255, 180);
});

t.layers.base.synth(osc(12, 0.1).rotate([0, 1].fit(-3.14, 3.14)).scale([0, 1].fit(0.5, 2.5)).color(0.9, 0.2, 0.6));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
