/**
 * @title TextmodeLayer.clearSynth
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
let synthActive = true;

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

	drawText('TEXTMODELAYER.CLEARSYNTH', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('RESET THE SYNTHETIC GRID', x, y++, 120, 220, 255);
	drawText('All three targets vanish together.', x, y++, 160, 180, 210);
	drawText('The label remains as plain text.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText(synthActive ? 'ACTIVE: clearSynth in 8 seconds' : 'CLEARED: base layer is plain', x, y++, 150, 255, 190);
});

const glyphField = shape(6, 0.34, 0.025)
	.repeat(4, 3)
	.rotate(0.22, 0.015)
	.screen(osc(10, 0.016, 1.1).kaleid(4), 0.35);
const inkField = moire(9, 13, 0.1, 1.55, 0.018)
	.color(1.0, 0.34, 0.12)
	.screen(osc(5, 0.02, 1.7).color(0.18, 0.78, 1.0), 0.38);
const paperField = plasma(3.2, 0.016, 0.5, 1.06)
	.brightness(0.2)
	.color(0.18, 0.06, 0.18)
	.softlight(noise(2.4, 0.014), 0.24);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

setTimeout(() => {
	t.layers.base.clearSynth();
	synthActive = false;
}, 8000);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
