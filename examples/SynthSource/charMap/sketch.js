/**
 * @title SynthSource.charMap
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const ramp = ' .:+oO0#@';

// Smooth rotating wave + orb spans 0..1 brightness across the custom ramp.
const wave = osc(5, 0.35, 1.3).rotate(0.45).color(0.3, 0.92, 1.0);
const orb = shape(24, 0.38, 0.3).color(1.0, 0.55, 0.25);
const out = wave.blend(orb, 0.5);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(ramp).cellColor(0.03, 0.05, 0.1));

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
	t.print('SYNTHSOURCE.CHARMAP', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM GLYPH RAMP', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Maps brightness onto a char string.', left + 3, top + 6);
	t.print('Dark cells stay blank; peaks get @.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CHARMAP: '${ramp}'`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
