/**
 * @title SynthSource.clamp
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
		['SYNTHSOURCE.CLAMP', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: VALUE WINDOWING', [140, 210, 255]],
		['Clamp caps the color range.', [140, 160, 190]],
		['Levels reveal the clipped band.', [140, 160, 190]],
		['Single chain: source, then clamp.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['RANGE: 0.18-0.74 FIXED', [140, 255, 200]],
	]);
});

t.synth(
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
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
