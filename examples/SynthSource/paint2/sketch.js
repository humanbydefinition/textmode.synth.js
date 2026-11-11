/**
 * @title SynthSource.paint2
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
		['SYNTHSOURCE.PAINT2', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PAINT SOURCE FIELD', [140, 210, 255]],
		['Paint receives a full source.', [140, 160, 190]],
		['Base motion supplies glyphs.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['PAINT(FIELD): NO COLOR OVERRIDES', [140, 255, 200]],
	]);
});

const paintField = plasma(4.4, 0.022, 0.18, 1.16).colorama(0.16).modulateHue(osc(5, 0.012).kaleid(5), 2.6);

t.synth(
	moire(8, 9, 0.15, 1.58, 0.018)
		.modulateRotate(noise(2.0, 0.012), 0.24, 0.03)
		.paint(paintField)
		.charMap(glyphs)
		.contrast(1.2)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
