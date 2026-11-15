/**
 * @title SynthSource.modulateScrollY
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const scrollAt = (secs) => 0.35 + 0.2 * Math.sin(secs * 1.25);

const mod = osc(10, 0.3, 0.0).blend(voronoi(3.0, 0.35, 0.4), 0.35);
const out = osc(26, 0.06, 0.4)
	.rotate(Math.PI / 2)
	.contrast(1.3)
	.color(0.35, 1.0, 0.62)
	.modulateScrollY(mod, ({ time }) => scrollAt(time), -0.16);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.07, 0.04));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const status = `Scroll Y: ${scrollAt(t.secs).toFixed(2)} | Speed: -0.16`;
	const width = 37 + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATESCROLLY', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VERTICAL COORDINATE SCROLL', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Modulator brightness shifts Y coords.', left + 3, top + 6);
	t.print('Horizontal bands shear up and down.', left + 3, top + 7);
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
