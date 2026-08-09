/**
 * @title Textmodifier.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(48);

const labelLayer = t.layers.add();
const glyphs = ' .:-=+*#%@';
const rhythm = [6, 12, 8, 16].fast(0.35).ease('easeInOutCubic');
const phase = [0.05, 0.48, 0.88, 0.28].fast(0.35).ease('easeInOutCubic');

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

	drawText('TEXTMODIFIER.BPM', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('MASTER CLOCK FOR ALL TARGETS', x, y++, 120, 220, 255);
	drawText('One BPM advances every field.', x, y++, 160, 180, 210);
	drawText('Glyph, ink, and paper stay synced.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('t.bpm(48)', x, y++, 150, 255, 190);
});

const glyphField = osc(rhythm, 0.022, phase).rotate(phase, 0.005).kaleid(6);
const inkField = moire(rhythm.fit(7, 15), rhythm.fit(9, 18), phase, 1.55, 0.016)
	.color(1.0, 0.32, 0.5)
	.screen(osc(rhythm.fit(3, 8), 0.02, 1.5).color(0.3, 0.7, 1.0), 0.34);
const paperField = plasma(rhythm.fit(2.4, 4.4), 0.016, phase, 1.04)
	.brightness(0.2)
	.color(0.08, 0.06, 0.24)
	.softlight(noise(2.2, 0.014), 0.24);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
