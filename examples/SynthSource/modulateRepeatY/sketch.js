/**
 * @title SynthSource.modulateRepeatY
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const repSteps = [3, 4, 3, 2];
const offsetAt = (secs) => 0.26 + 0.14 * Math.sin(secs * 1.35);

const mod = osc(6, 0.35, 0.0)
	.rotate(Math.PI / 2)
	.blend(noise(2.0, 0.3), 0.35);
const out = shape(3, 0.34, 0.06)
	.color(0.42, 0.95, 0.92)
	.blend(osc(14, 0.15, 0.3).color(0.62, 0.48, 1.0), 0.35)
	.modulateRepeatY(mod, repSteps.fast(0.65), ({ time }) => offsetAt(time));
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.09));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const reps = repSteps[Math.floor(t.secs * 0.65) % repSteps.length];
	const status = `Reps Y: ${reps} | Offset: ${offsetAt(t.secs).toFixed(2)}`;
	const width = 36 + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEREPEATY', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: Y-AXIS REPEAT MODULATION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Tiles rows vertically by reps.', left + 3, top + 6);
	t.print('Modulator shifts rows horizontally.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(status, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
