/**
 * @title ModulatedArray.ease
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(17);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .:-=+*#%@';
const fold = [-0.85, -0.2, 0.45, 1.05].fast(0.2).ease('easeInOutCubic');
const span = [0.58, 1.18, 0.74, 1.32].fast(0.2).ease('easeInOutCubic');

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
		['MODULATEDARRAY.EASE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: EASED FOLD TRANSITIONS', [140, 210, 255]],
		['Easing changes travel, not values.', [140, 160, 190]],
		['The fold accelerates mid-step.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		["array.ease('easeInOutCubic')", [140, 255, 200]],
	]);
});

const glyphField = shape(4, 0.38, 0.025).scale(span).rotate(fold).repeat(4, 3);
const lines = osc(12, 0.018, 1.3).rotate(fold, 0.006).kaleid(4);
const inkField = shape(4, 0.38, 0.025)
	.scale(span)
	.rotate(fold)
	.repeat(4, 3)
	.color(1.0, 0.72, 0.2)
	.screen(osc(12, 0.018, 1.3).rotate(fold, 0.006).kaleid(4).color(0.38, 0.3, 1.0), 0.42);
const paperField = plasma(span.fit(2.5, 4.2), 0.014, 0.35, 1.0).brightness(0.2).color(0.18, 0.09, 0.3);

t.synth(char(glyphField.add(lines, 0.38)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
