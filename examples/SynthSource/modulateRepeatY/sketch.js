/**
 * @title SynthSource.modulateRepeatY
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

	drawText('SYNTHSOURCE.MODREPEATY', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Y REPEAT MODULATION', x, y++, 120, 220, 255);
	drawText('Rows offset by source.', x, y++, 160, 180, 210);
	drawText('Vertical echoes rise.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = plasma(4.2, 0.024, 0.0, 1.12).color(0.42, 1.0, 0.58).modulateRotate(noise(2.0, 0.015), 0.28, 0.04);
const paper = moire(6, 7, 0.0, 1.57, 0.018).color(0.025, 0.13, 0.065).softlight(noise(2.0, 0.014), 0.18);

t.layers.base.synth(
	plasma(4.2, 0.022, 0.3, 1.12)
		.modulateRepeatY(osc(4, 0.012).rotate(turn), [3, 6].fast(0.1).ease('easeInOutSine'), 0.22)
		.color(0.35, 0.95, 0.65)
		.modulateScrollX(noise(2.0, 0.014), 0.06, -0.006)
		.contrast(1.16)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
