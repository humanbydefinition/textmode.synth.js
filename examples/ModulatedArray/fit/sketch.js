/**
 * @title ModulatedArray.fit
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(17);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = '  .:-=+*#@';
const rawSurvey = [14, 37, 82, 145].fast(0.2).smooth(0.8);
const heading = rawSurvey.fit(-0.75, 0.75);
const magnify = rawSurvey.fit(0.68, 1.28);
const detail = rawSurvey.fit(5, 18);

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
		['MODULATEDARRAY.FIT', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: ONE SURVEY, THREE RANGES', [140, 210, 255]],
		['fit remaps values without retiming.', [140, 160, 190]],
		['Angle, scale, and detail stay linked.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['rawSurvey.fit(low, high)', [140, 255, 200]],
	]);
});

const glyphField = moire(detail, detail, 0.04, 1.57, 0.012).rotate(heading).scale(magnify);
const marker = shape(5, 0.34, 0.03).rotate(heading).scale(magnify);
const inkField = moire(detail, detail, 0.04, 1.57, 0.012)
	.rotate(heading)
	.scale(magnify)
	.color(0.72, 0.32, 1.0)
	.screen(shape(5, 0.34, 0.03).rotate(heading).scale(magnify).color(0.2, 0.95, 0.72), 0.5);
const paperField = plasma(rawSurvey.fit(2.4, 4.5), 0.014, 0.4, 1.0).brightness(0.2).color(0.1, 0.05, 0.28);

t.synth(char(glyphField.add(marker, 0.32)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
