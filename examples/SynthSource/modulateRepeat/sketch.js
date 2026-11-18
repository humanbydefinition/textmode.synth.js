/**
 * @title SynthSource.modulateRepeat
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const repSteps = [
	[2, 2],
	[3, 2],
	[4, 3],
	[3, 3],
];

const mod = plasma(2.2, 0.45, 0.3, 1.2);
const out = shape(6, 0.36, 0.06)
	.color(0.3, 0.82, 1.0)
	.add(shape(3, 0.18, 0.04).color(0.7, 0.32, 0.52))
	.modulateRepeat(mod, repSteps.map(([x]) => x).fast(0.7), repSteps.map(([, y]) => y).fast(0.7), 0.28, 0.24);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.04, 0.09));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const [rx, ry] = repSteps[Math.floor(t.secs * 0.7) % repSteps.length];
	const status = `Repeat: ${rx}x${ry} | Offset: 0.28, 0.24`;
	const width = 36 + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MODULATEREPEAT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: 2D MODULATED TILING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Tiles source on X and Y with warp.', left + 3, top + 6);
	t.print('R and G channels shift tile offsets.', left + 3, top + 7);
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
