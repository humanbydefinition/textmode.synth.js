/**
 * @title SynthSource.screen
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const beam = shape(6, 0.34, 0.16)
	.scroll(
		({ time }) => Math.cos(time * 0.9) * 0.22,
		({ time }) => Math.sin(time * 0.9) * 0.16
	)
	.color(1.0, 0.62, 0.18);

// Screen sums light where the orbiting amber beam crosses cobalt polar rings.
const out = osc(16, 0.12).polar().color(0.15, 0.48, 0.98).screen(beam, 1.0);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.01, 0.02, 0.05));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.push();
	t.translate(left + 2 + width / 2, top + 2 + height / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SCREEN', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ADDITIVE LIGHT SCREEN', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Inverts, multiplies, and inverts.', left + 3, top + 6);
	t.print('Overlapping beams glow brighter.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('Cobalt rings + orbiting gold hex', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
