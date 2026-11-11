/**
 * @title paint.paint3
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
		['PAINT.PAINT3', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: TOP LEVEL PAINT TEXTURE', [140, 210, 255]],
		['paint(src) fills cells and ink.', [140, 160, 190]],
		['char(src) sculpts the glyphs.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['paint(src).char(src)', [140, 255, 200]],
	]);
});

const paintField = plasma(3.8, 0.02, 0.3, 1.14)
	.colorama(0.12)
	.softlight(osc(10, 0.012, 0.7).color(1.0, 0.55, 0.32), 0.28);
const glyphField = noise(4.5, 0.018)
	.modulateKaleid(osc(2.6, 0.008), 5)
	.levels(0.18, 0.86, 0.05, 1.0, 0.82)
	.contrast(1.12);

t.synth(paint(paintField).char(glyphField).charMap(glyphs));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
