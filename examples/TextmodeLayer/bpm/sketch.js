/**
 * @title TextmodeLayer.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);
t.layers.base.bpm(54);

const labelLayer = t.layers.add();
const glyphs = ' .,:;=xX#@';
const pulse = [5, 9, 15, 7].fast(0.42).ease('easeInOutSine');
const turn = [-0.5, -0.05, 0.55, 0.95].fast(0.42).ease('easeInOutSine');

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

	drawText('TEXTMODELAYER.BPM', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('LOCAL TEMPO, SHARED CANVAS', x, y++, 120, 220, 255);
	drawText('Base arrays run at 54 BPM.', x, y++, 160, 180, 210);
	drawText('The HUD keeps the 18 BPM master.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('t.layers.base.bpm(54)', x, y++, 150, 255, 190);
});

const glyphField = moire(pulse, pulse.fit(8, 18), 0.08, 1.55, 0.018).rotate(turn).kaleid(5);
const inkField = osc(pulse.fit(4, 10), 0.02, 1.2)
	.rotate(turn, 0.008)
	.color(0.24, 1.0, 0.58)
	.screen(moire(8, 12, turn, 1.55, 0.014).color(1.0, 0.64, 0.16), 0.3);
const paperField = plasma(pulse.fit(2.5, 4.5), 0.016, 0.3, 1.04)
	.brightness(0.2)
	.color(0.04, 0.18, 0.1)
	.softlight(noise(2.2, 0.014), 0.24);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
