/**
 * @title SynthSource.add
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getAmount = () => 0.5 + 0.5 * Math.sin(t.secs * 1.1);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const amount = getAmount().toFixed(2);
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.ADD', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ADDITIVE LIGHT MIXING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Sums RGB channels of two sources.', left + 3, top + 6);
	t.print('Overlaps brighten toward white.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`ADD AMOUNT: ${amount} | CORAL + CYAN`, left + 3, top + 9);
});

const base = osc(9, 0.09, 0.0).color(0.95, 0.32, 0.18);
const overlay = shape(4, 0.44, 0.16)
	.scroll(
		() => Math.sin(t.secs * 0.8) * 0.22,
		() => Math.cos(t.secs * 0.6) * 0.18
	)
	.color(0.18, 0.75, 1.0);
const out = base.add(overlay, getAmount);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.02, 0.06));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
