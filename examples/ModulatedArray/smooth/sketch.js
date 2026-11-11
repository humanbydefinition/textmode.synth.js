/**
 * @title ModulatedArray.smooth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(16);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = '  .,:;=xX#@';
const tideAngle = [-0.9, -0.15, 0.5, 1.15].fast(0.18).smooth(0.9);
const tideScale = [0.78, 1.16, 0.92, 1.28].fast(0.18).smooth(0.9);

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['MODULATEDARRAY.SMOOTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CONTINUOUS TIDE BETWEEN STEPS', [140, 210, 255]],
		['Smooth blends neighbor values.', [140, 160, 190]],
		['The contour never snaps in place.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['array.smooth(0.9)', [140, 255, 200]],
	]);
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
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
