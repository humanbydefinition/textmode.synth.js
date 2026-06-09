/**
 * @title SynthSource.noise
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

	drawText(`SYNTHSOURCE.NOISE`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: PERLIN NOISE FIELD`, x, y++, 100, 220, 255);
	drawText(`Generates organic, fluid-like noise.`, x, y++, 140, 160, 190);
	drawText(`Smooth pseudo-random spatial field.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Octaves: 8 | Falloff: 0.2`, x, y++, 140, 255, 180);
});

t.layers.base.synth(noise(8, 0.2).colorama(0.5).pixelate([16, 32].ease('easeInOutSine')));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
