/**
 * @title SynthSource.blend
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getAmount = () => 0.5 - 0.45 * Math.cos(t.secs * 1.1);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const amount = getAmount().toFixed(2);
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.BLEND', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: LINEAR CROSSFADE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Interpolates between two sources.', left + 3, top + 6);
	t.print('0 shows A; 1 shows B; 0.5 mixes.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`BLEND: ${amount} | VORONOI <-> HEX`, left + 3, top + 9);
});

const cells = voronoi(4.5, 0.35, 0.35).color(0.2, 0.75, 1.0);
const hexes = shape(6, 0.46, 0.1).rotate(0, 0.35).repeat(3, 2).color(1.0, 0.46, 0.18);
const out = cells.blend(hexes, getAmount);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
