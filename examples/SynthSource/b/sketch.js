/**
 * @title SynthSource.b
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .:-=+*#%@';
const turn = [-0.42, 0.42].fast(0.14).ease('easeInOutSine');

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
		['SYNTHSOURCE.B', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: BLUE CHANNEL EXTRACTION', [140, 210, 255]],
		['Blue drives glyph luminance.', [140, 160, 190]],
		['Ink and cells keep moving.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['BLUE GAIN: 1.60 FIXED', [140, 255, 200]],
	]);
});

const ink = osc(5, 0.018, 1.1).kaleid(4).color(0.45, 0.72, 1.0).modulate(noise(2.2, 0.018), 0.025);
const paper = plasma(3.6, 0.028, 0.1, 1.05).color(0.03, 0.08, 0.18).modulateScale(noise(2.0, 0.015), 0.22, 0.95);

t.synth(
	osc(14, 0.024, 1.5)
		.rotate(turn, 0.003)
		.kaleid(6)
		.color(0.16, 0.34, 1.0)
		.mult(noise(2.8, 0.02), 0.42)
		.b(1.6, 0.03)
		.modulateKaleid(noise(2.0, 0.016), 6)
		.contrast(1.24)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
