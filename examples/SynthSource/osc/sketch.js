/**
 * @title SynthSource.osc
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const frequencies = [8, 16, 24];
const freqAt = (secs) => frequencies[Math.floor(secs * 0.45) % frequencies.length];

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const freq = freqAt(t.secs);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.OSC', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SINE WAVE OSCILLATOR', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Generates scrolling RGB sine bands.', left + 3, top + 6);
	t.print('offset shifts R, G, and B phases.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`FREQ ${freq} | SYNC 0.18 | OFFSET 0.6`, left + 3, top + 9);
});

// Pure RGB sine bands: frequency steps across [8, 16, 24] while offset=0.6 separates R/G/B fringes.
const bands = osc((ctx) => freqAt(ctx.time), 0.18, 0.6);
const glyphs = bands.clone();

t.synth(bands.char(glyphs).cellColor(0.02, 0.03, 0.08).charMap(' .:-=+*#%@'));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
