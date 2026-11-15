/**
 * @title TextmodeLayer.synth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const fxLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Base layer draws a calm procedural dot grid beneath the synth overlay.
t.draw(() => {
	const halfCols = Math.floor(t.grid.cols / 2);
	const halfRows = Math.floor(t.grid.rows / 2);
	t.background(6, 10, 24);
	t.charColor(40, 72, 128);
	for (let y = -halfRows; y <= halfRows; y += 2) {
		for (let x = -halfCols; x <= halfCols; x += 2) {
			t.push();
			t.translate(x, y);
			t.char((x + y) % 4 === 0 ? '+' : '·');
			t.rect(1, 1);
			t.pop();
		}
	}
});

// Added layer synthesizes a luminous ring over transparent cells.
const ring = shape(6, 0.46, 0.04)
	.diff(shape(6, 0.24, 0.04))
	.add(shape(4, 0.14, 0.03))
	.rotate(0, 0.4);
const glyphs = ring.clone();
const ink = osc(5, 0.35, 1.4).color(0.3, 0.95, 1.0).brightness(0.2);

fxLayer.synth(ring.char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0, 0, 0, 0));

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('TEXTMODELAYER.SYNTH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SYNTH ON AN ADDED LAYER', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Base layer draws the dim slate grid.', left + 3, top + 6);
	t.print('fxLayer floats a synth ring on top.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('fxLayer.synth(ringSource)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
