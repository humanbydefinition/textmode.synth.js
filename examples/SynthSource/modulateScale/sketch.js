/**
 * @title SynthSource.modulateScale
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
		['SYNTHSOURCE.MODULATESCALE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: SOURCE-DRIVEN SCALE', [140, 210, 255]],
		['Brightness zooms the whole field.', [140, 160, 190]],
		['Nested rings breathe slowly.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['SCALE: 0.75-1.25 EASED | MIX 0.9', [140, 255, 200]],
	]);
});

const ink = osc(5, 0.018, 1.1).kaleid(4).color(0.45, 0.72, 1.0).modulate(noise(2.2, 0.018), 0.025);
const paper = plasma(3.6, 0.028, 0.1, 1.05).color(0.03, 0.08, 0.18).modulateScale(noise(2.0, 0.015), 0.22, 0.95);

t.synth(
	osc(9, 0.02, 1.4)
		.modulateScale(noise(2.4, 0.018), [0.75, 1.25].fast(0.12).ease('easeInOutSine'), 0.9)
		.kaleid(6)
		.color(0.35, 0.8, 1.0)
		.overlay(plasma(3, 0.018).color(1.0, 0.38, 0.62), 0.22)
		.contrast(1.16)
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
