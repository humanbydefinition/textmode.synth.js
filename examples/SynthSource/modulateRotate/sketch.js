/**
 * @title SynthSource.modulateRotate
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const multAt = (secs) => 1.4 - Math.cos(secs * 1.1);

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const mult = multAt(t.secs).toFixed(2);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEROTATE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: DIFFERENTIAL TWIST', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Rotates UVs per pixel by modulator.', left + 3, top + 6);
	t.print('Parallel bars swirl into vortices.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`ROTATE MULT: ${mult} | OFF 0.15`, left + 3, top + 9);
});

const bars = osc(20, 0.08, 0.5).color(1.0, 0.72, 0.28);

// Twist parallel amber bars differentially across the screen under a moving plasma field.
const out = bars.modulateRotate(plasma(4, 0.65, 0, 1.2), (ctx) => multAt(ctx.time), 0.15);
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.02, 0.06));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
