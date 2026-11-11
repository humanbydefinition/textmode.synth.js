/**
 * @title SynthSource.repeat
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

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
		['SYNTHSOURCE.REPEAT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: TILING COORDINATES', [140, 210, 255]],
		['Repeats space on X and Y axes.', [140, 160, 190]],
		['Creates multiple repeating tiles.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['Repeat: eased X and Y, 2 to 5', [140, 255, 200]],
	]);
});

t.synth(shape(3, 0.3, 0.05).repeat([2, 5].ease('easeInOutSine'), [2, 5].ease('easeInOutSine')).color(0.8, 0.2, 0.8));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
