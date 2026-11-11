/**
 * @title SynthSource.lighten
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
		['SYNTHSOURCE.LIGHTEN', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LIGHTEN BLENDING (MAX)', [140, 210, 255]],
		['Selects the lighter pixels of sources.', [140, 160, 190]],
		['Creates bright grid intersections.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['Oscillators merged with max-blend', [140, 255, 200]],
	]);
});

t.synth(
	osc(15, 0.1)
		.color(0.1, 0.5, 0.9)
		.lighten(osc(15, 0.12).rotate(1.57).color(0.9, 0.1, 0.4), 1.0)
		.charMap(' .:-=+*#%@')
		.cellColor(0.02, 0.02, 0.05)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
