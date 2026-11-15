/**
 * @title SynthSource.polar
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const getAngle = () => (t.secs * 0.5) % (Math.PI * 2);
const getRadius = () => 1.2 + 0.5 * Math.sin(t.secs * 0.9);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const angle = getAngle().toFixed(2);
	const radius = getRadius().toFixed(2);
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.POLAR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CARTESIAN TO POLAR', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('X maps angle, Y maps radius.', left + 3, top + 6);
	t.print('Linear bands wrap to rings/spokes.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`ANGLE: ${angle} | RADIUS: ${radius}`, left + 3, top + 9);
});

const spokes = osc(Math.PI * 12, 0.08, 0.85);
const rings = osc(22, 0.14, 0.0).rotate(Math.PI / 2);
const wrapped = spokes.add(rings, 0.5).contrast(1.25).polar(getAngle, getRadius);
const glyphs = wrapped.clone();

t.synth(wrapped.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
