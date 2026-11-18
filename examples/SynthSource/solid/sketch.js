/**
 * @title SynthSource.solid
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .:-=+*#%@';
const grayDelta = ({ time }) => 0.35 * Math.sin(time * 1.4);

const field = solid(0.55).brightness(grayDelta);

t.synth(field.clone().char(field).charMap(glyphs).cellColor(0.03, 0.035, 0.045));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor((cols - 1) / 2), -Math.floor(rows / 2)];
	const gray = 0.55 + 0.35 * Math.sin(t.secs * 1.4);
	const glyph = glyphs[Math.min(Math.floor(gray * glyphs.length), glyphs.length - 1)];
	const status = `Gray: ${gray.toFixed(2)} | Glyph: '${glyph}'`;
	const width = Math.max(36, [...status].length) + 2;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (7 + 5) / 2);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SOLID', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: GRAYSCALE SOLID', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('One scalar fills the entire grid.', left + 3, top + 6);
	t.print('Value drives both gray and glyph.', left + 3, top + 7);
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
