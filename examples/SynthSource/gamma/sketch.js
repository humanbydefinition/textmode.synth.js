/**
 * @title SynthSource.gamma
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let gammaAmt = 1.0;

// Soft radial orb + wave halo has rich midtones that respond visibly to gamma.
const orb = shape(24, 0.2, 0.34).color(1.0, 0.65, 0.25);
const halo = osc(4, 0.12, 1.1).rotate(0.6).color(0.85, 0.3, 0.75);
const out = orb.blend(halo, 0.45).gamma((ctx) => {
	gammaAmt = 1.4 + 1.05 * Math.sin(ctx.time * 1.3);
	return gammaAmt;
});

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.04, 0.02, 0.06));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	const effect = gammaAmt < 0.85 ? 'CRUSH MIDS' : gammaAmt > 1.25 ? 'LIFT SHADOWS' : 'LINEAR';
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.GAMMA', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: GAMMA TONE CURVE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Nonlinear curve shifts midtones.', left + 3, top + 6);
	t.print('Values >1 lift shadows; <1 darken.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`GAMMA: ${gammaAmt.toFixed(2)} (${effect})`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
