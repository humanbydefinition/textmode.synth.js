/**
 * @title EasingFunction.easingFunction
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(16);

const labelLayer = t.layers.add();
const glyphs = '  .:-=+*#@';
const lingerThenRush = (phase) => (phase < 0.5 ? 8 * phase ** 4 : 1 - 8 * (phase - 1) ** 4);
const aperture = [0.26, 0.73, 0.38, 0.82].fast(0.18).ease(lingerThenRush);
const turn = [-0.75, 0.38, 1.1, -0.2].fast(0.18).ease(lingerThenRush);

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

	drawText('EASINGFUNCTION.EASINGFUNCTION', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('CUSTOM MOTION CURVE', x, y++, 120, 220, 255);
	drawText('The field pauses, then rushes.', x, y++, 160, 180, 210);
	drawText('A function shapes interpolation.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('array.ease(lingerThenRush)', x, y++, 150, 255, 190);
});

const gate = shape(4, aperture, 0.03).rotate(turn).repeat(2, 2);
const glyphField = osc(9, 0.018, 1.1).rotate(turn, 0.008).kaleid(6);
const inkField = osc(9, 0.018, 1.1)
	.rotate(turn, 0.008)
	.kaleid(6)
	.color(0.3, 0.9, 1.0)
	.add(shape(4, aperture, 0.03).rotate(turn).repeat(2, 2).color(1.0, 0.26, 0.12), 0.55);
const paperField = plasma(aperture.fit(2.8, 4.4), 0.015, 0.25, 1.05).brightness(0.2).color(0.1, 0.08, 0.28);

t.synth(char(glyphField.mask(gate)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
