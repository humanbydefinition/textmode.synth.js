/**
 * @title SynthSource.shear
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const shearX = [-0.5, 0.5].fast(0.4).ease('sin');
const shearY = [-0.45, 0.45].fast(0.4).ease('sin').offset(0.5);

// Hollow square frames keep parallel edges straight while leaning into parallelograms.
const tiles = shape(4, 0.82, 0.04)
	.diff(shape(4, 0.42, 0.04))
	.repeat(7, 5)
	.shear(shearX, shearY, 0.5, 0.5);

const glyphs = tiles.clone();

t.synth(tiles.color(0.38, 0.78, 1.0).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.1));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + (width - 1) / 2, top + 2 + (height - 1) / 2);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SHEAR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: AFFINE COORDINATE SLANT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Shifts axes proportionally to slant.', left + 3, top + 6);
	t.print('Squares skew into parallelograms.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Shear X: -0.5..0.5 | Y: -0.45..0.45', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
