/**
 * @title SynthSource.sub
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getAmount = () => 0.5 + 0.5 * Math.sin(t.secs * 1.1);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const amount = getAmount().toFixed(2);
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SUB', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SUBTRACTIVE CARVING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Subtracts RGB channels of a source.', left + 3, top + 6);
	t.print('Alpha stays 0 on the cutter shape.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SUB AMOUNT: ${amount} | CARVED GOLD`, left + 3, top + 9);
});

const base = plasma(5, 0.35, 0, 1.15).color(1.0, 0.82, 0.28);
// Keep cutter alpha 0 so subtracting RGBA leaves base alpha opaque (1.0).
const cutter = shape(5, 0.48, 0.14).rotate(0, 0.45).color(0.95, 0.95, 0.95, 0);
const out = base.sub(cutter, getAmount);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.02, 0.05));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
