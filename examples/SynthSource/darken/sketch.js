/**
 * @title SynthSource.darken
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

	drawText('SYNTHSOURCE.DARKEN', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: DARKEN BLENDING (MIN)', x, y++, 100, 220, 255);
	drawText('Selects the darker pixels of sources.', x, y++, 140, 160, 190);
	drawText('Creates interesting grid shadows.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Oscillators merged with min-blend', x, y++, 140, 255, 180);
});

t.layers.base.synth(
	osc(15, 0.1)
		.color(0.9, 0.3, 0.6)
		.darken(osc(15, 0.12).rotate(1.57).color(0.2, 0.8, 1.0), 1.0)
		.charMap(' .:-=+*#%@')
		.cellColor(0.02, 0.02, 0.05)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
