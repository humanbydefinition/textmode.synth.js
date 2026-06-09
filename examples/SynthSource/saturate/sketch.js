/**
 * @title SynthSource.saturate
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

	drawText('SYNTHSOURCE.SATURATE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COLOR SATURATION', x, y++, 100, 220, 255);
	drawText('Controls saturation of the color output.', x, y++, 140, 160, 190);
	drawText('Cycles from grayscale to neon colors.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Saturate: Eased cycle (0.0 to 4.0)', x, y++, 140, 255, 180);
});

t.layers.base.synth(
	noise(6, 0.1)
		.color(0.3, 0.7, 0.9)
		.saturate([0.0, 4.0].ease('easeInOutSine'))
		.charMap(' .:-=+*#%@')
		.cellColor(0.05, 0.05, 0.1)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
