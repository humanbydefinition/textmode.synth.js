/**
 * @title Textmodifier.synth
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
		['TEXTMODIFIER.SYNTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: BASE-LAYER SYNTH SHORTCUT', [140, 210, 255]],
		['t.synth routes to the base layer.', [140, 160, 190]],
		['It receives all three fields.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['t.synth(threeTargetSource)', [140, 255, 200]],
	]);
});

const glyphField = plasma(5.5, 0.02, 0.3, 1.2)
	.modulate(moire(7, 10, 0.12, 1.5, 0.014), 0.08)
	.kaleid(5);
const inkField = osc(6, 0.018, 1.2)
	.rotate(0.25, 0.006)
	.color(0.9, 0.3, 1.0)
	.screen(moire(10, 14, 0.1, 1.55, 0.016).color(0.18, 0.82, 1.0), 0.34);
const paperField = plasma(3.2, 0.015, 0.7, 1.04)
	.brightness(0.2)
	.color(0.12, 0.04, 0.2)
	.softlight(noise(2.0, 0.012), 0.24);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
