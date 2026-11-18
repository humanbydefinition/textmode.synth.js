/**
 * @title charColor.charColor2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const ch = (secs, phase) => 0.62 + 0.36 * Math.sin(secs * 1.4 + phase);

const paper = voronoi(3.5, 0.35, 0.45).color(0.04, 0.07, 0.16);
const glyphs = osc(12, 0.32, 0.0).rotate(0.55).modulate(noise(2.6, 0.35), 0.14).contrast(1.25);

t.synth(
	charColor(
		({ time }) => ch(time, 0),
		({ time }) => ch(time, 2.1),
		({ time }) => ch(time, 4.2),
		1.0
	)
		.char(glyphs)
		.charMap(' .:-=+*#%@')
		.cellColor(paper)
);

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const [r, g, b] = [0, 2.1, 4.2].map((p) => ch(t.secs, p));
	const status = `RGBA: ${r.toFixed(2)}, ${g.toFixed(2)}, ${b.toFixed(2)}, 1.00`;
	const width = 38 + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('CHARCOLOR.CHARCOLOR2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: TOP-LEVEL RGBA INK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('charColor(r,g,b,a) sets uniform ink.', left + 3, top + 6);
	t.print('Cell color & glyphs animate freely.', left + 3, top + 7);
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
