/**
 * @title charColor.charColor2
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
const breathe = [0.22, 0.78].fast(0.18).ease('easeInOutSine');
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

	drawText('CHARCOLOR.CHARCOLOR2', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('TOP LEVEL INK RGBA', x, y++, 120, 220, 255);
	drawText('Creates glyph color first.', x, y++, 160, 180, 210);
	drawText('Cells remain source driven.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('Separate animated ink and paper.', x, y++, 150, 255, 190);
});

const paper = noise(3.0, 0.025).color(0.16, 0.055, 0.025).softlight(osc(4, 0.016), 0.22);

t.layers.base.synth(
	charColor(breathe, breathe.offset(0.3), 0.18, 1.0)
		.char(noise(4.2, 0.028).kaleid(5).rotate(turn, 0.002))
		.charMap(glyphs)
		.cellColor(paper)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
