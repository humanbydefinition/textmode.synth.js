/**
 * @title SynthSource.clamp
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .:-=+*#%@';

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

	drawText('SYNTHSOURCE.CLAMP', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('VALUE WINDOWING', x, y++, 120, 220, 255);
	drawText('Clamp caps the color range.', x, y++, 160, 180, 210);
	drawText('Levels reveal the clipped band.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Single chain: source -> clamp.', x, y++, 150, 255, 190);
});

t.layers.base.synth(
	plasma(6.0, 0.12, 0.2, 1.45)
		.add(osc(12, 0.06, 1.1).kaleid(5), 0.28)
		.colorama(0.12)
		.clamp(0.18, 0.74)
		.levels(0.18, 0.74, 0.04, 1.0, 0.88)
		.contrast(1.28)
		.color(0.3, 0.78, 1.0)
		.charMap(glyphs)
		.cellColor(0.015, 0.02, 0.035)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
