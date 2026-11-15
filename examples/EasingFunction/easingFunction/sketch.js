/**
 * @title EasingFunction.easingFunction
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const lingerThenRush = (p) => (p < 0.5 ? 8 * p ** 4 : 1 - 8 * (p - 1) ** 4);
const radius = [0.24, 0.72, 0.34, 0.82].fast(0.85).ease(lingerThenRush);
const turn = [-0.75, 0.45, 1.15, -0.2].fast(0.85).ease(lingerThenRush);

const star = shape(4, radius, 0.06).rotate(turn).repeat(2, 2);
const waves = osc(8, 0.25, 1.1).rotate(turn).kaleid(6);
const glyphs = star.clone().add(waves, 0.55);
const ink = waves
	.clone()
	.color(0.28, 0.92, 1.0)
	.add(star.clone().color(1.0, 0.38, 0.16), 0.7);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.04, 0.05, 0.14));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('EASINGFUNCTION.EASINGFUNCTION', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM EASING CALLBACK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Pass (p) => ... directly to ease().', left + 3, top + 6);
	t.print('Motion lingers, then snaps rapidly.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('array.ease(lingerThenRush)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
