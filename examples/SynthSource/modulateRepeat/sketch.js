/**
 * @title SynthSource.modulateRepeat
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

	drawText('SYNTHSOURCE.MODREPEAT', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('WARPED TILING', x, y++, 120, 220, 255);
	drawText('A source offsets repeats.', x, y++, 160, 180, 210);
	drawText('Tiles swim in formation.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = plasma(4.2, 0.024, 0.0, 1.12).color(0.42, 1.0, 0.58).modulateRotate(noise(2.0, 0.015), 0.28, 0.04);
const paper = moire(6, 7, 0.0, 1.57, 0.018).color(0.025, 0.13, 0.065).softlight(noise(2.0, 0.014), 0.18);

t.layers.base.synth(
	osc(8, 0.018, 1.0)
		.modulateRepeat(
			noise(2.5, 0.018),
			[2, 4].fast(0.1).ease('easeInOutSine'),
			[3, 5].fast(0.12).ease('easeInOutSine'),
			0.18,
			0.12
		)
		.color(0.35, 0.85, 1.0)
		.softlight(plasma(3, 0.018), 0.32)
		.contrast(1.18)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
