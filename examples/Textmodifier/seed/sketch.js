/**
 * @title Textmodifier.seed
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.seed(2026);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .,:;=xX#@';

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
		['TEXTMODIFIER.SEED', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: REPEATABLE THREE-FIELD TERRAIN', [140, 210, 255]],
		['Seed locks every random source.', [140, 160, 190]],
		['Reload keeps the same terrain.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['t.seed(2026)', [140, 255, 200]],
	]);
});

const glyphField = noise(5.4, 0.025)
	.modulate(voronoi(5.5, 0.022, 0.58), 0.16)
	.contrast(1.2);
const inkField = voronoi(6.2, 0.018, 0.48)
	.color(0.32, 0.95, 0.7)
	.screen(noise(4.0, 0.02).color(1.0, 0.46, 0.12), 0.32);
const paperField = noise(3.2, 0.016)
	.brightness(0.2)
	.color(0.05, 0.18, 0.13)
	.softlight(voronoi(4.0, 0.014, 0.65), 0.28);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
