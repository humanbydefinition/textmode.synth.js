/**
 * @title SynthSource.rotate
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

	drawText('SYNTHSOURCE.ROTATE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COORDINATE ROTATION', x, y++, 100, 220, 255);
	drawText('Rotates space by angle and speed.', x, y++, 140, 160, 190);
	drawText('Creates spinning visual movements.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Rotate: Continuous spin (speed 1.0)', x, y++, 140, 255, 180);
});

t.layers.base.synth(
	osc(18, 0.1).color(0.2, 0.6, 1.0).rotate(0.0, 1.0).charMap(' .:-=+*#%@').cellColor(0.05, 0.05, 0.15)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
