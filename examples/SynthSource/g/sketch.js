/**
 * @title SynthSource.g
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let gScale = 1.0;

// Combine three distinct RGB motifs; .g() isolates only the diamond grid.
const redTri = shape(3, 0.34, 0.03).rotate(0, 0.55).color(1, 0, 0);
const greenGrid = shape(4, 0.4, 0.03).rotate(0.7854).repeat(4, 4).scroll(0, 0, 0.14, 0.14).color(0, 1, 0);
const blueRings = shape(24, 0.42, 0.03)
	.diff(shape(24, 0.28, 0.03))
	.color(0, 0, 1);

const out = redTri
	.add(greenGrid)
	.add(blueRings)
	.g((ctx) => {
		gScale = 1.05 + 0.35 * Math.sin(ctx.time * 1.5);
		return gScale;
	}, 0.0);

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.015, 0.05, 0.025));

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.G', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: GREEN CHANNEL EXTRACTION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Isolates green from RGB geometry.', left + 3, top + 6);
	t.print('Outputs grayscale with scale+offset.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CHANNEL G | SCALE: ${gScale.toFixed(2)} (GRID)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
