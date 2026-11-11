/**
 * @title ModulatedArray.offset
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
const phaseA = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.0);
const phaseB = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.33);
const phaseC = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.66);

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
		['MODULATEDARRAY.OFFSET', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PHASE-SHIFTED SIGNAL RELAY', [140, 210, 255]],
		['Identical arrays start offset.', [140, 160, 190]],
		['Three pulses take turns leading.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['phase.offset(0.0, 0.33, 0.66)', [140, 255, 200]],
	]);
});

const beaconA = osc(8, 0.02, 1.0).rotate(phaseA).kaleid(5).color(1.0, 0.18, 0.32);
const beaconB = osc(8, 0.02, 1.0).rotate(phaseB).kaleid(5).color(0.16, 0.86, 1.0);
const beaconC = osc(8, 0.02, 1.0).rotate(phaseC).kaleid(5).color(1.0, 0.72, 0.18);
const relay = beaconA.screen(beaconB, 0.36).screen(beaconC, 0.28).contrast(1.15);
const glyphField = relay;
const inkField = osc(8, 0.02, 1.0)
	.rotate(phaseA)
	.kaleid(5)
	.color(1.0, 0.18, 0.32)
	.screen(osc(8, 0.02, 1.0).rotate(phaseB).kaleid(5).color(0.16, 0.86, 1.0), 0.36)
	.screen(osc(8, 0.02, 1.0).rotate(phaseC).kaleid(5).color(1.0, 0.72, 0.18), 0.28);
const paperField = plasma(phaseB.fit(2.5, 4.2), 0.014, 0.55, 1.0).brightness(0.2).color(0.08, 0.08, 0.26);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
