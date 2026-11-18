/**
 * @title ModulatedArray.ease
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const twist = [-0.8, 0.8, -0.35, 1.2].fast(0.9).ease('easeInOutCubic');
const zoom = [0.65, 1.35, 0.8, 1.5].fast(0.9).ease('easeInOutCubic');

const diamonds = shape(4, 0.44, 0.06).scale(zoom).rotate(twist).repeat(3, 3);
const waves = osc(8, 0.25, 1.2).rotate(twist).kaleid(4);
const glyphs = diamonds.clone().add(waves, 0.45);
const ink = diamonds
	.clone()
	.color(1.0, 0.72, 0.2)
	.screen(waves.clone().color(0.45, 0.45, 1.0), 0.5);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.05, 0.04, 0.14));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('MODULATEDARRAY.EASE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: EASED KEYFRAME MOTION', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Easing curves dwell near stops and', left + 3, top + 6);
	t.print('accelerate across each step.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print("array.ease('easeInOutCubic')", left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
