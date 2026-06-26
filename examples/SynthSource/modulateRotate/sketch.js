/**
 * @title SynthSource.modulateRotate
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
const slow = [0.0, 1.0].fast(0.16).ease('easeInOutSine');
const turn = [-0.42, 0.42].fast(0.14).ease('easeInOutSine');

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

	drawText('SYNTHSOURCE.MODROTATE', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('SOURCE DRIVEN ROTATION', x, y++, 120, 220, 255);
	drawText('Brightness turns the field.', x, y++, 160, 180, 210);
	drawText('Local vortices move gently.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = osc(6, 0.018, 1.6).rotate(turn, 0.002).color(0.9, 0.58, 1.0).modulateKaleid(noise(2.0, 0.014), 5);
const paper = plasma(3.2, 0.024, 0.2, 1.08).color(0.08, 0.035, 0.16).hue(slow);

t.layers.base.synth(
	osc(10, 0.02, 1.1)
		.modulateRotate(noise(2.8, 0.02), [0.25, 0.9].fast(0.12).ease('easeInOutSine'), 0.08)
		.kaleid(5)
		.color(0.85, 0.35, 1.0)
		.screen(plasma(3, 0.018), 0.22)
		.contrast(1.18)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
