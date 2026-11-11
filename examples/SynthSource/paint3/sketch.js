/**
 * @title SynthSource.paint3
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
		['SYNTHSOURCE.PAINT3', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PAINT TEXTURE SOURCE', [140, 210, 255]],
		['One source paints both layers.', [140, 160, 190]],
		['Nested motion adds depth.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['PAINT(FIELD): NO COLOR OVERRIDES', [140, 255, 200]],
	]);
});

const paintField = moire(7, 8, 0.32, 1.5, 0.016)
	.color(0.3, 0.9, 0.72)
	.overlay(plasma(3.4, 0.018, 0.2, 1.05).color(0.9, 0.42, 0.85), 0.36);

t.synth(
	plasma(4.6, 0.02, 0.1, 1.18).modulateKaleid(noise(2.1, 0.012), 6).paint(paintField).charMap(glyphs).contrast(1.16)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
