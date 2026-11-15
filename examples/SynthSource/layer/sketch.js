/**
 * @title SynthSource.layer
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getOrbit = () => Math.sin(t.secs * 0.9) * 0.11;

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const x = getOrbit().toFixed(2);
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.LAYER', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ALPHA COMPOSITING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Composites B over A by B alpha.', left + 3, top + 6);
	t.print('luma() keys out dark background.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`STAR OFFSET X: ${x} | LUMA KEY`, left + 3, top + 9);
});

const bg = plasma(5, 0.35, 0, 1.1).color(0.14, 0.76, 0.68);
const fg = shape(5, 0.38, 0.08).rotate(0, 0.5).scroll(getOrbit, 0).color(1.0, 0.38, 0.55).luma(0.25, 0.1);
const out = bg.layer(fg);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
