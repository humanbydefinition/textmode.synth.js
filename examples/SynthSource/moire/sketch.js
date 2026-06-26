/**
 * @title SynthSource.moire
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

	drawText(`SYNTHSOURCE.MOIRE`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: MOIRE INTERFERENCE`, x, y++, 100, 220, 255);
	drawText(`Creates optical interference grids.`, x, y++, 140, 160, 190);
	drawText(`Combines rotating high-frequency waves.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Freq: 15 | Scale: 0.1 | Mod: Mult`, x, y++, 140, 255, 180);
});

t.layers.base.synth(
	moire(15, 0.1, 0.8)
		.mult(osc(8, -0.05, 1.2).rotate(1.5))
		.color(0.2, 0.7, 1.0)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
