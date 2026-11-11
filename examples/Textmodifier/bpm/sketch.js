/**
 * @title Textmodifier.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(48);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .:-=+*#%@';
const rhythm = [6, 12, 8, 16].fast(0.35).ease('easeInOutCubic');
const phase = [0.05, 0.48, 0.88, 0.28].fast(0.35).ease('easeInOutCubic');

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
		['TEXTMODIFIER.BPM', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: MASTER CLOCK FOR TARGETS', [140, 210, 255]],
		['One BPM advances every field.', [140, 160, 190]],
		['Glyph, ink, paper stay synced.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['t.bpm(48)', [140, 255, 200]],
	]);
});

const glyphField = osc(rhythm, 0.022, phase).rotate(phase, 0.005).kaleid(6);
const inkField = moire(rhythm.fit(7, 15), rhythm.fit(9, 18), phase, 1.55, 0.016)
	.color(1.0, 0.32, 0.5)
	.screen(osc(rhythm.fit(3, 8), 0.02, 1.5).color(0.3, 0.7, 1.0), 0.34);
const paperField = plasma(rhythm.fit(2.4, 4.4), 0.016, phase, 1.04)
	.brightness(0.2)
	.color(0.08, 0.06, 0.24)
	.softlight(noise(2.2, 0.014), 0.24);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
