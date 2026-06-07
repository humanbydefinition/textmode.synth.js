/**
 * @title SynthSource.gamma
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

	drawText(`SYNTHSOURCE.GAMMA`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: GAMMA CORRECTION`, x, y++, 100, 220, 255);
	drawText(`Nonlinear midtone correction.`, x, y++, 140, 160, 190);
	drawText(`Punches details in plasma.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Gamma Exponent: 0.3 to 3.0`, x, y++, 140, 255, 180);
});

t.layers.base.synth(plasma(6, 0.2).gamma([0.3, 3.0].ease('easeInOutQuad')).color(0.3, 0.8, 0.9));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
