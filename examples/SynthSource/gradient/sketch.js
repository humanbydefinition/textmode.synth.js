/**
 * @title SynthSource.gradient
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
		['SYNTHSOURCE.GRADIENT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RADIAL UV GRADIENT', [140, 210, 255]],
		['Pure UV becomes color.', [140, 160, 190]],
		['Channels add slow parallax.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['Separate animated ink and paper.', [140, 255, 200]],
	]);
});

const ink = osc(6, 0.018, 1.6).rotate(turn, 0.002).color(0.9, 0.58, 1.0).modulateKaleid(noise(2.0, 0.014), 5);
const paper = plasma(3.2, 0.024, 0.2, 1.08).color(0.08, 0.035, 0.16).hue(slow);
const gradientBase = gradient(0.025).twirl([1.8, 3.6].fast(0.1).ease('easeInOutSine'), 0.7).kaleid(5);

t.synth(
	gradientBase
		.hue([0.0, 0.14].fast(0.08).ease('linear'))
		.mult(gradient(0.022).twirl([2.2, 3.4].fast(0.1).ease('easeInOutSine').offset(0.5), 0.6).kaleid(4), 0.6)
		.blend(gradientBase.clone().rotate(0.7).hue([0.45, 0.58].fast(0.08).ease('linear')), 0.22)
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
