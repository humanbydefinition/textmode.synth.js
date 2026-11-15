/**
 * @title Textmodifier.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(120);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const rhythm = [4, 8, 14, 6].ease('easeInOutCubic');
const phase = [0.0, 0.78, 1.57, 2.35].ease('easeInOutCubic');

const pattern = osc(rhythm, 0.08, phase).rotate(phase).kaleid(6);
const glyphs = pattern.clone();
const ink = osc(rhythm.fit(3, 8), 0.25, 1.5).brightness(0.22).color(1.0, 0.42, 0.68).hue(phase);

t.synth(pattern.char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.04, 0.03, 0.12));

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	const beat = (Math.floor(t.secs * 2) % 4) + 1;
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('TEXTMODIFIER.BPM', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: MASTER ARRAY CLOCK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('t.bpm(120) sets beats per minute.', left + 3, top + 6);
	t.print('All modulated arrays step in sync.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`BPM: 120 | BEAT: ${beat}/4`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
