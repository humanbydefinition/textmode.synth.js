/**
 * @title SynthSource.kaleid
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const sides = [3, 5, 6, 8];
const currentSides = () => sides[Math.floor(t.secs * 0.5) % sides.length];

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const n = currentSides();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.KALEID', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RADIAL WEDGE FOLDING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Folds angles into N mirror wedges.', left + 3, top + 6);
	t.print('Higher counts tighten the rosette.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SIDES: ${n} | WEDGE SYMMETRY`, left + 3, top + 9);
});

const wedge = osc(10, 0.12, 0.9)
	.add(shape(3, 0.36, 0.06).scroll(0.2, 0.1), 0.65)
	.rotate(0, 0.35)
	.kaleid(currentSides);

const glyphs = wedge.clone();

t.synth(wedge.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.01, 0.06));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
