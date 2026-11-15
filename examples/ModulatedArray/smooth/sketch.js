/**
 * @title ModulatedArray.smooth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const outerBase = [0.11, 0.27, 0.15, 0.25];
const innerBase = [0.04, 0.12, 0.06, 0.1];

const rightMask = gradient(0).r().thresh(0.5, 0.002);
const leftMask = rightMask.clone().invert();
const divider = gradient(0).r().thresh(0.495, 0.002).diff(gradient(0).r().thresh(0.505, 0.002));
const backdrop = osc(10, 0.2).rotate(1.57).color(0.25);

const leftRing = shape(8, [...outerBase].fast(0.9), 0.025)
	.diff(shape(4, [...innerBase].fast(0.9), 0.02))
	.scrollX(0.24)
	.scrollY(-0.06);
const rightRing = shape(8, [...outerBase].fast(0.9).smooth(1), 0.025)
	.diff(shape(4, [...innerBase].fast(0.9).smooth(1), 0.02))
	.scrollX(-0.24)
	.scrollY(-0.06);

const leftSide = solid(0, 0, 0).add(leftRing, 1).add(backdrop, 0.8).mult(leftMask);
const rightSide = solid(0, 0, 0).add(rightRing, 1).add(backdrop, 0.8).mult(rightMask);

const glyphs = solid(0, 0, 0).add(leftSide, 1).add(rightSide, 1).add(divider, 0.9);
const ink = solid(0, 0, 0)
	.add(leftSide.clone().color(1.0, 0.42, 0.78), 1)
	.add(rightSide.clone().color(0.32, 0.96, 0.72), 1)
	.add(divider.clone().color(0.6, 0.75, 0.95), 0.9);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.04, 0.06, 0.13));

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
	t.print('MODULATEDARRAY.SMOOTH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: STEP VS SMOOTH BLEND', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Left jumps straight to keyframes.', left + 3, top + 6);
	t.print('Right glides smoothly via smooth(1).', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('L: HARD STEP  |  R: .smooth(1)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
