/**
 * @title ModulatedArray.arrays
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(18);

const labelLayer = t.layers.add();
const glyphs = ' .,:;=xX#@';
const frequencies = [6, 12, 24, 9].fast(0.32);
const facets = [3, 5, 8, 4].fast(0.32);
const headings = [0.0, 0.45, 0.95, 1.35].fast(0.32);

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('MODULATEDARRAY.ARRAYS', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('DISCRETE PATTERN SEQUENCER', x, y++, 120, 220, 255);
	drawText('Arrays cycle parameters by beat.', x, y++, 160, 180, 210);
	drawText('Each step swaps the whole field.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('[6, 12, 24, 9].fast(0.32)', x, y++, 150, 255, 190);
});

const glyphField = osc(frequencies, 0.028, 0.8).rotate(headings).kaleid(facets);
const inkField = osc([3, 5, 7, 4].fast(0.32), 0.02, 1.2).color(1.0, 0.54, 0.16);
const paperField = plasma([2.4, 3.2, 4.1, 2.7].fast(0.32), 0.02, 0.2).brightness(0.22).color(0.22, 0.07, 0.3);

t.synth(char(glyphField.contrast(1.18)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
