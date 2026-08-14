/**
 * @title ModulatedArray.fast
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .-:=+*#%@';
const shutter = [4, 14, 28, 9].fast(1.25);
const slowFrame = [3, 5, 7, 4].fast(0.22);
const spin = [-0.4, 0.1, 0.65, 1.1].fast(1.25);

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

	drawText('MODULATEDARRAY.FAST', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('RELATIVE RATE SHUTTER', x, y++, 120, 220, 255);
	drawText('Fast arrays change before frames.', x, y++, 160, 180, 210);
	drawText('The outer lattice drifts slowly.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('shutter.fast(1.25)', x, y++, 150, 255, 190);
});

const glyphField = osc(shutter, 0.02, 1.0).rotate(spin).kaleid(8);
const frame = moire(6, 8, 0.05, 1.57, 0.014).kaleid(slowFrame);
const inkField = osc(shutter, 0.02, 1.0)
	.rotate(spin)
	.kaleid(8)
	.color(1.0, 0.22, 0.45)
	.screen(moire(6, 8, 0.05, 1.57, 0.014).kaleid(slowFrame).color(0.25, 0.72, 1.0), 0.38);
const paperField = plasma(shutter.fit(2.4, 4.5), 0.014, 0.4, 1.0).brightness(0.22).color(0.25, 0.04, 0.16);

t.synth(char(glyphField.screen(frame, 0.3)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
