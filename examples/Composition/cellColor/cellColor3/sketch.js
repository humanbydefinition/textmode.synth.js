/**
 * @title cellColor.cellColor3
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .:-=+*#%@';

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['CELLCOLOR.CELLCOLOR3', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: TOP LEVEL CELL GRAY', [140, 210, 255]],
		['One value fills all cells.', [140, 160, 190]],
		['Animated ink adds color.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['cellColor(gray) | ink animates', [140, 255, 200]],
	]);
});

const ink = plasma(4.2, 0.024, 0.0, 1.12).color(0.42, 1.0, 0.58).modulateRotate(noise(2.0, 0.015), 0.28, 0.04);

t.synth(
	cellColor([0.04, 0.2].fast(0.12).ease('easeInOutSine'))
		.char(plasma(4.4, 0.024, 0.1, 1.12).kaleid(5))
		.charMap(glyphs)
		.charColor(ink)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
