/**
 * @title SynthSource.b
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let bScale = 1.0;

// Combine three distinct RGB motifs; .b() isolates only the pulsing rings.
const redTri = shape(3, 0.34, 0.03).rotate(0, 0.55).color(1, 0, 0);
const greenGrid = shape(4, 0.4, 0.03).rotate(0.7854).repeat(4, 4).scroll(0, 0, 0.14, 0.14).color(0, 1, 0);
const blueRings = shape(24, 0.42, 0.03)
	.diff(shape(24, 0.28, 0.03))
	.add(shape(24, 0.15, 0.03))
	.scale((ctx) => 0.85 + 0.22 * Math.sin(ctx.time * 1.4))
	.color(0, 0, 1);

const out = redTri
	.add(greenGrid)
	.add(blueRings)
	.b((ctx) => {
		bScale = 1.05 + 0.35 * Math.sin(ctx.time * 1.5);
		return bScale;
	}, 0.0);

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.015, 0.025, 0.06));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.B', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: BLUE CHANNEL EXTRACTION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Isolates blue from RGB geometry.', left + 3, top + 6);
	t.print('Outputs grayscale with scale+offset.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CHANNEL B | SCALE: ${bScale.toFixed(2)} (RINGS)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
