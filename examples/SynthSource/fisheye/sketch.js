/**
 * @title SynthSource.fisheye
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const lensX = [0.3, 0.7].fast(0.35).ease('sin');
const lensY = [0.35, 0.65].fast(0.35).ease('sin').offset(0.5);

// Orbit a hemispherical fisheye lens over a woven two-tone plaid lattice.
const plaid = osc(42, 0, 0)
	.thresh(0.76, 0.04)
	.blend(
		osc(42, 0, 0)
			.rotate(Math.PI / 2)
			.thresh(0.76, 0.04),
		0.5
	)
	.fisheye(4.5, lensX, lensY);

const glyphs = plaid.clone();

t.synth(plaid.color(1.0, 0.44, 0.36).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.06, 0.02, 0.03));

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
	t.print('SYNTHSOURCE.FISHEYE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: HEMISPHERICAL DOME LENS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Compresses space with atan falloff.', left + 3, top + 6);
	t.print('Dome center glides across the plaid.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Amount: 4.5 | Orbiting lens center', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
