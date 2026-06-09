/**
 * @title SynthSource.gradient
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .:-=+*#%@';
const slow = [0.0, 1.0].fast(0.16).ease('easeInOutSine');
const turn = [-0.42, 0.42].fast(0.14).ease('easeInOutSine');

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('SYNTHSOURCE.GRADIENT', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('RADIAL UV GRADIENT', x, y++, 120, 220, 255);
	drawText('Pure UV becomes color.', x, y++, 160, 180, 210);
	drawText('Channels add slow parallax.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = osc(6, 0.018, 1.6).rotate(turn, 0.002).color(0.9, 0.58, 1.0).modulateKaleid(noise(2.0, 0.014), 5);
const paper = plasma(3.2, 0.024, 0.2, 1.08).color(0.08, 0.035, 0.16).hue(slow);
const gradientBase = gradient(0.025).twirl([1.8, 3.6].fast(0.1).ease('easeInOutSine'), 0.7).kaleid(5);

t.layers.base.synth(
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
});
