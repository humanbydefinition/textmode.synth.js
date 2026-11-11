/**
 * @title SynthSource.luma
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
		['SYNTHSOURCE.LUMA', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LUMINANCE KEY', [140, 210, 255]],
		['Brightness becomes alpha.', [140, 160, 190]],
		['Two fields reveal each other.', [140, 160, 190]],
		['Separate animated ink and paper.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['LUMA KEY: 0.38-0.58 EASED', [140, 255, 200]],
	]);
});

const ink = moire(8, 9, 0.15, 1.6, 0.025).color(1.0, 0.62, 0.34).modulate(noise(2.3, 0.018), 0.022);
const paper = noise(3.0, 0.025).color(0.16, 0.055, 0.025).softlight(osc(4, 0.016), 0.22);

t.synth(
	osc(9, 0.02, 1.3)
		.kaleid(5)
		.modulateScale(noise(2.1, 0.014), 0.24, 0.95)
		.color(1.0, 0.55, 0.25)
		.luma([0.38, 0.58].fast(0.14).ease('easeInOutSine'), 0.14)
		.layer(noise(3.2, 0.02).color(0.1, 0.32, 0.9).luma(0.52, 0.18))
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
