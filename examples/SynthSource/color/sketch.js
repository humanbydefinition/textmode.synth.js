/**
 * @title SynthSource.color
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const wave = osc(7, 0.25, 1.3).kaleid(5).rotate(0, 0.22);
const rightMask = gradient(0).r().thresh(0.5, 0.001);
const leftMask = rightMask.clone().invert();

const full = wave.clone().mask(leftMask);
const scaled = wave.clone().color(0.42).mask(rightMask);
const out = full.add(scaled, 1.0);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.06));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const status = 'Left: 1.00x | Right: .color(0.42)';
	const width = Math.max(36, [...status].length) + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.COLOR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SCALAR COLOR MULTIPLY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('One scalar scales R, G, and B.', left + 3, top + 6);
	t.print('Right half shows 42% intensity.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(status, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
