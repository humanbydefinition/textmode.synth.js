/**
 * @title ModulatedArray.arrays
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const freqs = [5, 11, 18, 8].fast(1.0);
const sides = [3, 4, 6, 8].fast(1.0);
const angles = [0.0, 0.45, 0.9, 1.35].fast(1.0);

const glyphs = osc(freqs, 0.32, 0.8).rotate(angles).kaleid(sides);

t.synth(
	glyphs
		.clone()
		.char(glyphs)
		.charMap(' .:-=+*#%@')
		.charColor(
			[1.0, 0.35, 0.95, 0.45].fast(1.0),
			[0.5, 0.9, 0.4, 0.85].fast(1.0),
			[0.25, 0.95, 0.9, 1.0].fast(1.0),
			1
		)
		.cellColor(0.05, 0.07, 0.14)
);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('MODULATEDARRAY.ARRAYS', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: DISCRETE STEP SEQUENCER', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Arrays step to new values per beat.', left + 3, top + 6);
	t.print('Freq, sides, and hue jump together.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('[3, 4, 6, 8] @ 72 BPM (HARD STEP)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
