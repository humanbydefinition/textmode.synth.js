/**
 * @title SynthSource.swirl
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const amount = [-5.0, 5.0].fast(0.35).ease('sin');

// XOR vertical and horizontal square waves into a crisp checkerboard.
const checker = osc(22, 0, 0)
	.thresh(0.5, 0.03)
	.diff(
		osc(22, 0, 0)
			.rotate(Math.PI / 2)
			.thresh(0.5, 0.03)
	)
	.swirl(amount, 0.5, 0.5);

const glyphs = checker.clone();

t.synth(checker.color(1.0, 0.65, 0.18).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.06, 0.03, 0.01));

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
	t.print('SYNTHSOURCE.SWIRL', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RADIAL DISTANCE VORTEX', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Rotation grows with center distance.', left + 3, top + 6);
	t.print('Outer bands wind into spiral arms.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Amount: -5..5 | Center: 0.5, 0.5', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
