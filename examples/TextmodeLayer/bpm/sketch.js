/**
 * @title TextmodeLayer.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(18);
t.layers.base.bpm(54);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const glyphs = ' .,:;=xX#@';
const pulse = [5, 9, 15, 7].fast(0.42).ease('easeInOutSine');
const turn = [-0.5, -0.05, 0.55, 0.95].fast(0.42).ease('easeInOutSine');

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
		['TEXTMODELAYER.BPM', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LOCAL TEMPO, SHARED CANVAS', [140, 210, 255]],
		['Base arrays run at 54 BPM.', [140, 160, 190]],
		['The HUD keeps 18 BPM.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['t.layers.base.bpm(54)', [140, 255, 200]],
	]);
});

const glyphField = moire(pulse, pulse.fit(8, 18), 0.08, 1.55, 0.018).rotate(turn).kaleid(5);
const inkField = osc(pulse.fit(4, 10), 0.02, 1.2)
	.rotate(turn, 0.008)
	.color(0.24, 1.0, 0.58)
	.screen(moire(8, 12, turn, 1.55, 0.014).color(1.0, 0.64, 0.16), 0.3);
const paperField = plasma(pulse.fit(2.5, 4.5), 0.016, 0.3, 1.04)
	.brightness(0.2)
	.color(0.04, 0.18, 0.1)
	.softlight(noise(2.2, 0.014), 0.24);

t.layers.base.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
