/**
 * @title TextmodeLayer.synth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);

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
		['TEXTMODELAYER.SYNTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ATTACH A LAYER SYNTH', [140, 210, 255]],
		['Glyph, ink, paper stay apart.', [140, 160, 190]],
		['Base layer owns the whole grid.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['t.layers.base.synth(source)', [140, 255, 200]],
	]);
});

const glyphField = moire(8, 11, 0.08, 1.48, 0.018)
	.modulate(osc(3, 0.012, 1.1), 0.045)
	.kaleid(5);
const inkField = osc(7, 0.018, 1.4)
	.rotate(0.2, 0.006)
	.color(0.18, 0.82, 1.0)
	.screen(moire(9, 12, 0.2, 1.5, 0.014).color(1.0, 0.26, 0.48), 0.32);
const paperField = plasma(3.6, 0.016, 0.25, 1.08)
	.brightness(0.2)
	.color(0.06, 0.12, 0.28)
	.softlight(noise(2.0, 0.014), 0.26);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
