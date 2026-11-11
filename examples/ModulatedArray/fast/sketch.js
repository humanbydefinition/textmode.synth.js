/**
 * @title ModulatedArray.fast
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .-:=+*#%@';
const shutter = [4, 14, 28, 9].fast(1.25);
const slowFrame = [3, 5, 7, 4].fast(0.22);
const spin = [-0.4, 0.1, 0.65, 1.1].fast(1.25);

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
		['MODULATEDARRAY.FAST', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RELATIVE RATE SHUTTER', [140, 210, 255]],
		['Fast arrays change before frames.', [140, 160, 190]],
		['The outer lattice drifts slowly.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['shutter.fast(1.25)', [140, 255, 200]],
	]);
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
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
