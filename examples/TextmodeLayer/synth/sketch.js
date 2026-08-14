/**
 * @title TextmodeLayer.synth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .,:;=xX#@';

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

	drawText('TEXTMODELAYER.SYNTH', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('ATTACH A THREE-TARGET SYNTH', x, y++, 120, 220, 255);
	drawText('Glyph, ink, and paper stay apart.', x, y++, 160, 180, 210);
	drawText('The base layer owns the whole grid.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('t.layers.base.synth(source)', x, y++, 150, 255, 190);
});

const glyphField = moire(8, 11, 0.08, 1.48, 0.018)
	.modulate(osc(3, 0.012, 1.1), 0.045)
	.kaleid(5);
const inkField = osc(7, 0.018, 1.4)
	.rotate(0.2, 0.006)
	.color(0.18, 0.82, 1.0)
	.screen(moire(9, 12, 0.2, 1.5, 0.014).color(1.0, 0.26, 0.48), 0.32);
const paperField = plasma(3.6, 0.016, 0.25, 1.08)
	.brightness(0.2)
	.color(0.06, 0.12, 0.28)
	.softlight(noise(2.0, 0.014), 0.26);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
