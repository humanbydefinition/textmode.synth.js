/**
 * @title SynthSource.paint2
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

	drawText('SYNTHSOURCE.PAINT2', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('PAINT SOURCE FIELD', x, y++, 120, 220, 255);
	drawText('Paint receives a full source.', x, y++, 160, 180, 210);
	drawText('Base motion supplies glyphs.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('paint(source), no color overrides.', x, y++, 150, 255, 190);
});

const paintField = plasma(4.4, 0.022, 0.18, 1.16).colorama(0.16).modulateHue(osc(5, 0.012).kaleid(5), 2.6);

t.layers.base.synth(
	moire(8, 9, 0.15, 1.58, 0.018)
		.modulateRotate(noise(2.0, 0.012), 0.24, 0.03)
		.paint(paintField)
		.charMap(glyphs)
		.contrast(1.2)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
