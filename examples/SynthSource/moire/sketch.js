/**
 * @title SynthSource.moire
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const angleAt = (secs) => 0.21 + Math.sin(secs * 0.55) * 0.13;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const angle = angleAt(t.secs).toFixed(2);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MOIRE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: OPTICAL BEAT GRATINGS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Overlaps two angled sine gratings.', left + 3, top + 6);
	t.print('Small angle tilt forms beat bands.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`FREQ 16/19 | ANGLE B: ${angle} RAD`, left + 3, top + 9);
});

// Two slightly offset gratings interfere to produce sweeping moire beat bands.
const bands = moire(16, 19, 0, (ctx) => angleAt(ctx.time), 0.6, 0).contrast(1.3);
const glyphs = bands.clone();

t.synth(bands.color(1.0, 0.82, 0.32).char(glyphs).cellColor(0.03, 0.02, 0.01).charMap(' .,:;=xX#@'));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
