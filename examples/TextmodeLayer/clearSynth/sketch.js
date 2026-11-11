/**
 * @title TextmodeLayer.clearSynth
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
let synthActive = true;

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
		['TEXTMODELAYER.CLEARSYNTH', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: RESET THE SYNTH GRID', [140, 210, 255]],
		['All three targets vanish together.', [140, 160, 190]],
		['Label stays as plain text.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		[`${synthActive ? 'ACTIVE: clears in 8 s' : 'CLEARED: synth stops updating'}`, [140, 255, 200]],
	]);
});

const glyphField = shape(6, 0.34, 0.025)
	.repeat(4, 3)
	.rotate(0.22, 0.015)
	.screen(osc(10, 0.016, 1.1).kaleid(4), 0.35);
const inkField = moire(9, 13, 0.1, 1.55, 0.018)
	.color(1.0, 0.34, 0.12)
	.screen(osc(5, 0.02, 1.7).color(0.18, 0.78, 1.0), 0.38);
const paperField = plasma(3.2, 0.016, 0.5, 1.06)
	.brightness(0.2)
	.color(0.18, 0.06, 0.18)
	.softlight(noise(2.4, 0.014), 0.24);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

setTimeout(() => {
	t.layers.base.clearSynth();
	synthActive = false;
}, 8000);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
