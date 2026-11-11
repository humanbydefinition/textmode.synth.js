/**
 * @title SynthSource.cellColor2
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
const turn = [-0.42, 0.42].fast(0.14).ease('easeInOutSine');

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
		['SYNTHSOURCE.CELLCOLOR2', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ANIMATED CELL RGBA', [140, 210, 255]],
		['Numbers animate the cell bed.', [140, 160, 190]],
		['Ink stays source driven.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['G/B: 0.22-0.78 | ALPHA 1.0', [140, 255, 200]],
	]);
});

const ink = osc(6, 0.018, 1.6).rotate(turn, 0.002).color(0.9, 0.58, 1.0).modulateKaleid(noise(2.0, 0.014), 5);

t.synth(
	osc(10, 0.018, 1.1)
		.kaleid(5)
		.color(0.9, 0.5, 0.3)
		.cellColor(0.03, breathe.offset(0.2), breathe.offset(0.55), 1.0)
		.modulateScale(noise(2.1, 0.014), 0.3, 0.92)
		.charMap(glyphs)
		.charColor(ink)
		.contrast(1.12)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
