/**
 * @title SynthSource.gradient
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

	drawText('SYNTHSOURCE.GRADIENT', x, y++, 255, 140, 255);
	drawText('------------------------------------', x, y++, 140, 70, 140);
	drawText('CONCEPT: RADIAL UV GRADIENT', x, y++, 255, 150, 255);
	drawText('Generates color from UV coordinates.', x, y++, 210, 160, 220);
	drawText('Kaleidoscope fractals from pure UV space.', x, y++, 210, 160, 220);
	drawText('------------------------------------', x, y++, 140, 70, 140);
	drawText('gradient(): Twirled + phase-offset clones', x, y++, 255, 160, 255);
});

const gradientBase = gradient(0.4).twirl([2.0, 6.0].ease('easeInOutSine'), 0.7).kaleid(6);

t.layers.base.synth(
	gradientBase
		.hue([0.0, 0.15].ease('linear'))
		.mult(gradient(0.4).twirl([3.0, 4.0].ease('easeInOutSine').offset(0.5), 0.6).kaleid(5))
		.blend(gradientBase.clone().rotate(1.0).hue([0.5, 0.65].ease('linear')), 0.3)
		.charMap(' .\u00b7\u00b0\u25e6\u25d8\u25cf\u25a0@\u2588\u2593\u2592')
		.charColor(0.8, 0.7, 1.0)
		.cellColor(0.05, 0.03, 0.12)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
