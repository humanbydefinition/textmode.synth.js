/**
 * @title SynthSource.lighten
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

	drawText('SYNTHSOURCE.LIGHTEN', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: LIGHTEN BLENDING (MAX)', x, y++, 100, 220, 255);
	drawText('Selects the lighter pixels of sources.', x, y++, 140, 160, 190);
	drawText('Creates bright grid intersections.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Oscillators merged with max-blend', x, y++, 140, 255, 180);
});

t.layers.base.synth(
	osc(15, 0.1)
		.color(0.1, 0.5, 0.9)
		.lighten(osc(15, 0.12).rotate(1.57).color(0.9, 0.1, 0.4), 1.0)
		.charMap(' .:-=+*#%@')
		.cellColor(0.02, 0.02, 0.05)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
