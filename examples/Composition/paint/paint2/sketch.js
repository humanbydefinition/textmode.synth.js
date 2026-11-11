/**
 * @title paint.paint2
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
		['PAINT.PAINT2', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: TOP LEVEL PAINT SOURCE', [140, 210, 255]],
		['paint(src) owns both colors.', [140, 160, 190]],
		['char(src) chooses glyphs.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['paint(src).char(src)', [140, 255, 200]],
	]);
});

const paintField = osc(7, 0.016, 1.4)
	.kaleid(6)
	.color(0.28, 0.76, 1.0)
	.modulate(plasma(2.6, 0.014, 0.1, 1.1), 0.025);
const glyphField = osc(9, 0.018, 1.2).kaleid(5).modulate(noise(2.2, 0.012), 0.018).levels(0.18, 0.88, 0.04, 1.0, 0.9);

t.synth(paint(paintField).char(glyphField).charMap(glyphs));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
