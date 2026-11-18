/**
 * @title ModulatedArray.fit
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const melody = [0, 0.4, 1, 0.2].fast(0.9).smooth(0.85);
const freq = melody.fit(4, 14);
const radius = melody.fit(0.28, 0.72);
const glow = melody.fit(0.45, 1.0);

const ring = shape(5, radius, 0.06);
const waves = osc(freq, 0.25, 1.0).rotate(0.5);
const glyphs = ring.clone().add(waves, 0.45);
const ink = waves
	.clone()
	.color(0.7, 0.36, 1.0)
	.screen(ring.clone().color(0.24, 0.96, 0.74), 0.6)
	.brightness(0.15);

t.synth(
	glyphs
		.clone()
		.char(glyphs)
		.charMap(' .:-=+*#%@')
		.charColor(ink.color(glow, 0.9, 1.0))
		.cellColor(0.04, 0.06, 0.14)
);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('MODULATEDARRAY.FIT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: REMAP ONE SHARED MELODY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('fit(low, high) scales one array', left + 3, top + 6);
	t.print('into freq, radius, and brightness.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('melody.fit(4,14) & fit(0.28,0.72)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
