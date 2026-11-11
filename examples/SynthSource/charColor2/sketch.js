/**
 * @title SynthSource.charColor2
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
const breathe = [0.22, 0.78].fast(0.18).ease('easeInOutSine');

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
		['SYNTHSOURCE.CHARCOLOR2', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ANIMATED FOREGROUND RGBA', [140, 210, 255]],
		['Numbers animate glyph ink.', [140, 160, 190]],
		['Paper remains source driven.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['RGB: 0.22-0.78 | ALPHA 1.0', [140, 255, 200]],
	]);
});

const paper = noise(3.0, 0.025).color(0.16, 0.055, 0.025).softlight(osc(4, 0.016), 0.22);

t.synth(
	noise(3.8, 0.025)
		.modulateScale(osc(3, 0.01), 0.25, 0.95)
		.charMap(glyphs)
		.charColor(breathe, breathe.offset(0.33), breathe.offset(0.66), 1.0)
		.cellColor(paper)
		.contrast(1.18)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
