/**
 * @title SynthSource.modulateScrollY
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
		['SYNTHSOURCE.MODULATESCROLLY', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: SOURCE-DRIVEN SCROLL Y', [140, 210, 255]],
		['Brightness shifts rows.', [140, 160, 190]],
		['A vertical tide folds light.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['SHIFT Y: 0.03-0.15 | SPEED -0.005', [140, 255, 200]],
	]);
});

const ink = plasma(4.2, 0.024, 0.0, 1.12).color(0.42, 1.0, 0.58).modulateRotate(noise(2.0, 0.015), 0.28, 0.04);
const paper = moire(6, 7, 0.0, 1.57, 0.018).color(0.025, 0.13, 0.065).softlight(noise(2.0, 0.014), 0.18);

t.synth(
	plasma(4.2, 0.022, 0.1, 1.12)
		.modulateScrollY(osc(4, 0.012).kaleid(4), [0.03, 0.15].fast(0.12).ease('easeInOutSine'), -0.005)
		.color(0.5, 0.95, 0.55)
		.overlay(noise(2.2, 0.016), 0.2)
		.contrast(1.12)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
