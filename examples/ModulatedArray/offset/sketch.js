/**
 * @title ModulatedArray.offset
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
const phaseA = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.0);
const phaseB = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.33);
const phaseC = [-0.55, 0.15, 0.72].fast(0.18).ease('easeInOutSine').offset(0.66);

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

	drawText('MODULATEDARRAY.OFFSET', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('PHASE-SHIFTED SIGNAL RELAY', x, y++, 120, 220, 255);
	drawText('Identical arrays start elsewhere.', x, y++, 160, 180, 210);
	drawText('Three pulses take turns leading.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('phase.offset(0.0, 0.33, 0.66)', x, y++, 150, 255, 190);
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
});
