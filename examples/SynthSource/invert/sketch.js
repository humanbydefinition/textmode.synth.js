/**
 * @title SynthSource.invert
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
const slow = [0.0, 1.0].fast(0.16).ease('easeInOutSine');
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
		['SYNTHSOURCE.INVERT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CONTROLLED INVERSION', [140, 210, 255]],
		['Inverse blends gradually.', [140, 160, 190]],
		['Foreground and cell diverge.', [140, 160, 190]],
		['Separate animated ink and paper.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['INVERT: 0.12-0.76 EASED', [140, 255, 200]],
	]);
});

const ink = osc(6, 0.018, 1.6).rotate(turn, 0.002).color(0.9, 0.58, 1.0).modulateKaleid(noise(2.0, 0.014), 5);
const paper = plasma(3.2, 0.024, 0.2, 1.08).color(0.08, 0.035, 0.16).hue(slow);

t.synth(
	voronoi(4.2, 0.05, 0.22)
		.modulateScale(osc(4, 0.014), 0.28, 0.92)
		.color(0.22, 0.68, 1.0)
		.invert([0.12, 0.76].fast(0.12).ease('easeInOutSine'))
		.screen(osc(7, 0.014).rotate(turn).color(1.0, 0.35, 0.7), 0.22)
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
