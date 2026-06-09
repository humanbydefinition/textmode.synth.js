/**
 * @title SynthSource.paint3
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

	drawText('SYNTHSOURCE.PAINT3', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('PAINT TEXTURE SOURCE', x, y++, 120, 220, 255);
	drawText('One source paints both layers.', x, y++, 160, 180, 210);
	drawText('Nested motion adds depth.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('paint(source), no color overrides.', x, y++, 150, 255, 190);
});

const paintField = moire(7, 8, 0.32, 1.5, 0.016)
	.color(0.3, 0.9, 0.72)
	.overlay(plasma(3.4, 0.018, 0.2, 1.05).color(0.9, 0.42, 0.85), 0.36);

t.layers.base.synth(
	plasma(4.6, 0.02, 0.1, 1.18).modulateKaleid(noise(2.1, 0.012), 6).paint(paintField).charMap(glyphs).contrast(1.16)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
