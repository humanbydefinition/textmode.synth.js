/**
 * @title ModulatedArray.arrays
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

	drawText(`MODULATEDARRAY.ARRAYS`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: POLYRHYTHMIC CYCLING`, x, y++, 100, 220, 255);
	drawText(`Cycles multiple params via arrays.`, x, y++, 140, 160, 190);
	drawText(`Polyrhythmic dynamic step motion.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Polyrhythms: Freq, Segment, Color`, x, y++, 140, 255, 180);
});

t.layers.base.synth(
	osc([8, 16, 32], 0.1, [0.5, 1.5])
		.kaleid([3, 5, 8])
		.color([1, 0].ease('linear'), [0, 1].ease('linear'), [0.5, 0.8].ease('linear'))
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
