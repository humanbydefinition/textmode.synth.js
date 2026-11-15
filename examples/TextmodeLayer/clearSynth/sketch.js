/**
 * @title TextmodeLayer.clearSynth
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const fxLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const burst = shape(5, 0.45, 0.04).mult(osc(10, 0.45)).rotate(0, 0.65);
const fxGlyphs = burst.clone();
const fxSource = burst
	.char(fxGlyphs)
	.charMap(' .:-=+*#%@')
	.charColor(1.0, 0.48, 0.24)
	.cellColor(0.06, 0.02, 0.12, 0.88);

let synthActive = true;
let phaseShift = 0;
fxLayer.synth(fxSource);

// Clear fxLayer buffer once cleared so the base layer ripples show cleanly.
fxLayer.draw(() => {
	if (!synthActive) t.clear();
});

t.draw(() => {
	const shouldBeActive = (t.secs + phaseShift) % 4.8 < 2.4;
	if (shouldBeActive !== synthActive) {
		synthActive = shouldBeActive;
		if (synthActive) fxLayer.synth(fxSource);
		else fxLayer.clearSynth();
	}

	const halfCols = Math.floor(t.grid.cols / 2);
	const halfRows = Math.floor(t.grid.rows / 2);
	const ramp = ' .:+*#@';
	t.background(8, 12, 26);
	for (let y = -halfRows; y <= halfRows; y += 1) {
		for (let x = -halfCols; x <= halfCols; x += 1) {
			const wave = 0.5 + 0.5 * Math.sin(Math.hypot(x, y * 1.6) * 0.38 - t.secs * 3.6);
			t.push();
			t.translate(x, y);
			t.char(ramp[Math.floor(wave * (ramp.length - 1))]);
			t.charColor(45 + wave * 90, 130 + wave * 110, 235);
			t.rect(1, 1);
			t.pop();
		}
	}
});

t.mouseClicked(() => {
	phaseShift += 2.4;
});

labelLayer.draw(() => {
	const left = -Math.floor(labelLayer.grid.cols / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.push();
	t.translate(left + 2 + 38 / 2, top + 2 + 9 / 2);
	t.char(' ');
	t.cellColor(6, 10, 22);
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('TEXTMODELAYER.CLEARSYNTH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: REMOVE A LAYER SYNTH', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Toggles fxLayer every 2.4 seconds.', left + 3, top + 6);
	t.print('Clearing reveals base-layer ripples.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(synthActive ? 'STATE: SYNTH ACTIVE (CLICK TOGGLE)' : 'STATE: CLEARED (BASE ONLY)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
