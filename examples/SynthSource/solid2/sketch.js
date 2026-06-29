/**
 * @title SynthSource.solid2
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
const breathe = [0.22, 0.78].fast(0.18).ease('easeInOutSine');

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

	drawText('SYNTHSOURCE.SOLID2', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('RGBA SOURCE', x, y++, 120, 220, 255);
	drawText('Four constants set color.', x, y++, 160, 180, 210);
	drawText('Motion comes from channels.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = moire(8, 9, 0.15, 1.6, 0.025).color(1.0, 0.62, 0.34).modulate(noise(2.3, 0.018), 0.022);
const paper = noise(3.0, 0.025).color(0.16, 0.055, 0.025).softlight(osc(4, 0.016), 0.22);

t.layers.base.synth(
	solid(0.04, breathe.offset(0.2), breathe.offset(0.55), 1.0)
		.overlay(voronoi(3.4, 0.04, 0.24).color(1.0, 0.45, 0.25), 0.28)
		.modulateScale(noise(2.0, 0.014), 0.2, 0.95)
		.contrast(1.12)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
