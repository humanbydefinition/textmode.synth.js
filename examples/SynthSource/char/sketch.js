/**
 * @title SynthSource.char
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

	drawText('SYNTHSOURCE.CHAR', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('SOURCE DRIVEN GLYPHS', x, y++, 120, 220, 255);
	drawText('Pattern selects characters.', x, y++, 160, 180, 210);
	drawText('Color channels move apart.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const ink = osc(5, 0.018, 1.1).kaleid(4).color(0.45, 0.72, 1.0).modulate(noise(2.2, 0.018), 0.025);
const paper = plasma(3.6, 0.028, 0.1, 1.05).color(0.03, 0.08, 0.18).modulateScale(noise(2.0, 0.015), 0.22, 0.95);

t.layers.base.synth(
	osc(9, 0.018, 1.1)
		.kaleid(5)
		.color(0.25, 0.75, 1.0)
		.char(noise(4.5, 0.035).modulateRotate(osc(3, 0.01), 0.35, 0.04))
		.modulate(noise(2.0, 0.014), 0.02)
		.charMap(glyphs)
		.charColor(ink)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
