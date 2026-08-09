/**
 * @title ModulatedArray.smooth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(16);

const labelLayer = t.layers.add();
const glyphs = '  .,:;=xX#@';
const tideAngle = [-0.9, -0.15, 0.5, 1.15].fast(0.18).smooth(0.9);
const tideScale = [0.78, 1.16, 0.92, 1.28].fast(0.18).smooth(0.9);

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

	drawText('MODULATEDARRAY.SMOOTH', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('CONTINUOUS TIDE BETWEEN STEPS', x, y++, 120, 220, 255);
	drawText('Smooth blends neighboring values.', x, y++, 160, 180, 210);
	drawText('The contour never snaps in place.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('array.smooth(0.9)', x, y++, 150, 255, 190);
});

const glyphField = moire(8, 11, 0.08, tideAngle, 0.012).scale(tideScale).rotate(tideAngle, 0.004).contrast(1.25);
const inkField = moire(8, 11, 0.08, tideAngle, 0.012)
	.scale(tideScale)
	.rotate(tideAngle, 0.004)
	.contrast(1.25)
	.color(0.42, 0.95, 0.72)
	.modulate(noise(2.0, 0.012), 0.018);
const paperField = plasma(tideScale.fit(2.5, 4.0), 0.016, 0.3, 1.0).brightness(0.2).color(0.04, 0.2, 0.16);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
