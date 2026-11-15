/**
 * @title SynthSource.diff
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getSlide = () => Math.sin(t.secs * 0.9) * 0.18;

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const slide = getSlide().toFixed(2);
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.DIFF', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ABSOLUTE DIFFERENCE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Computes abs(A - B) per channel.', left + 3, top + 6);
	t.print('Matches go dark; overlaps invert.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SLIDE X: ${slide} | INVERTED ZONE`, left + 3, top + 9);
});

const stripes = osc(8, 0.08, 0.7).rotate(0.25).color(0.2, 0.9, 1.0);
const diamond = shape(4, 0.48, 0.08).rotate(0, 0.45).scroll(getSlide, 0).color(1.0, 0.42, 0.25);
const out = stripes.diff(diamond);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
