/**
 * @title ModulatedArray.arrays
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .,:;=xX#@';
const frequencies = [6, 12, 24, 9].fast(0.32);
const facets = [3, 5, 8, 4].fast(0.32);
const headings = [0.0, 0.45, 0.95, 1.35].fast(0.32);

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
		['MODULATEDARRAY.ARRAYS', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: DISCRETE PATTERN SEQUENCER', [140, 210, 255]],
		['Arrays cycle parameters by beat.', [140, 160, 190]],
		['Each step swaps the whole field.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['[6, 12, 24, 9].fast(0.32)', [140, 255, 200]],
	]);
});

const glyphField = osc(frequencies, 0.028, 0.8).rotate(headings).kaleid(facets);
const inkField = osc([3, 5, 7, 4].fast(0.32), 0.02, 1.2).color(1.0, 0.54, 0.16);
const paperField = plasma([2.4, 3.2, 4.1, 2.7].fast(0.32), 0.02, 0.2).brightness(0.22).color(0.22, 0.07, 0.3);

t.synth(char(glyphField.contrast(1.18)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
