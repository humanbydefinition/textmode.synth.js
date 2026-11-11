/**
 * @title EasingFunction.easingFunction
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(16);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = '  .:-=+*#@';
const lingerThenRush = (phase) => (phase < 0.5 ? 8 * phase ** 4 : 1 - 8 * (phase - 1) ** 4);
const aperture = [0.26, 0.73, 0.38, 0.82].fast(0.18).ease(lingerThenRush);
const turn = [-0.75, 0.38, 1.1, -0.2].fast(0.18).ease(lingerThenRush);

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['EASINGFUNCTION.EASINGFUNCTION', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CUSTOM MOTION CURVE', [140, 210, 255]],
		['The field pauses, then rushes.', [140, 160, 190]],
		['A function shapes interpolation.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['array.ease(lingerThenRush)', [140, 255, 200]],
	]);
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
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
