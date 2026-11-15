/**
 * @title SynthSource.hue
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const hueAt = (secs) => (secs * 0.22) % 1;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const hueVal = hueAt(t.secs);
	const deg = Math.round(hueVal * 360);
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.HUE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: HSV HUE WHEEL', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Rotates colors 0.0-1.0 around HSV.', left + 3, top + 6);
	t.print('Luminance and form stay unchanged.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`HUE: ${hueVal.toFixed(2)} (${deg} DEG)`, left + 3, top + 9);
});

const triangles = shape(3, 0.36, 0.05).rotate(0, 0.4).repeat(3, 3, 0.5).color(1.0, 0.3, 0.2);
const backdrop = osc(6, 0.1, 0.5).color(0.12, 0.65, 0.85);

// Rotate complementary coral triangles and teal waves together around the full HSV wheel.
const out = backdrop.add(triangles, 0.85).hue((ctx) => hueAt(ctx.time));
const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
