/**
 * @title TextmodeLayer.bpm
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(60);

const fastLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
fastLayer.bpm(150);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Base layer pulses concentric emerald rings slowly at 60 BPM.
const baseRing = shape(6, [0.44, 0.72, 0.5, 0.78].ease('sin'), 0.1).mult(osc(10, 0.22));
const baseGlyphs = baseRing.clone();
t.layers.base.synth(
	baseRing.char(baseGlyphs).charMap(' .:-=+*#%@').charColor(0.24, 0.96, 0.62).cellColor(0.02, 0.07, 0.06)
);

// Fast layer steps an inner coral star rapidly at 150 BPM over transparent cells.
const fastStar = shape([3, 4, 6, 8].ease('easeInOutQuad'), [0.22, 0.34, 0.18, 0.3].ease('sin'), 0.03)
	.rotate([0, 0.8, 1.6, 2.4].ease('linear'))
	.thresh(0.18, 0.05);
const fastGlyphs = fastStar.clone();
fastLayer.synth(fastStar.char(fastGlyphs).charMap(' .:-=+*#%@').charColor(1.0, 0.54, 0.22).cellColor(0, 0, 0, 0));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('TEXTMODELAYER.BPM', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PER-LAYER TEMPO OVERRIDE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Outer base rings pulse at 60 BPM.', left + 3, top + 6);
	t.print('Inner star steps fast at 150 BPM.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('BASE: 60 BPM | FX LAYER: 150 BPM', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
