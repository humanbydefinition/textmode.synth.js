/**
 * @title paint.paint2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const ch = (secs, phase) => 0.62 + 0.36 * Math.sin(secs * 1.35 + phase);

const glyphs = osc(10, 0.3, 0.3).kaleid(5).modulateScale(plasma(2.5, 0.4), 0.35, 0.85).contrast(1.25);

t.synth(
	paint(
		({ time }) => ch(time, 0.4),
		({ time }) => ch(time, 2.5),
		({ time }) => ch(time, 4.6),
		1.0
	)
		.char(glyphs)
		.charMap(' .:-=+*#%@')
		.cellColor(
			({ time }) => ch(time, 0.4) * 0.18,
			({ time }) => ch(time, 2.5) * 0.18,
			({ time }) => ch(time, 4.6) * 0.18,
			1.0
		)
);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const [r, g, b] = [0.4, 2.5, 4.6].map((p) => ch(t.secs, p));
	const status = `RGBA: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}, 1.00`;
	const width = 38 + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('PAINT.PAINT2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL RGBA PAINT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('paint(r,g,b,a) sets both ink & cell.', left + 3, top + 6);
	t.print('Darker cellColor reveals the glyphs.', left + 3, top + 7);
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
