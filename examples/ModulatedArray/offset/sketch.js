/**
 * @title ModulatedArray.offset
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(72);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const base = [0.08, 0.19, 0.12];
const radA = [...base].fast(0.9).ease('sin').offset(0.0);
const radB = [...base].fast(0.9).ease('sin').offset(0.33);
const radC = [...base].fast(0.9).ease('sin').offset(0.66);

const backdrop = osc(10, 0.22).rotate(1.57).color(0.24);
const hexA = shape(6, radA, 0.025).scrollX(0.27).scrollY(-0.08);
const hexB = shape(6, radB, 0.025).scrollY(-0.08);
const hexC = shape(6, radC, 0.025).scrollX(-0.27).scrollY(-0.08);

const glyphs = solid(0, 0, 0).add(backdrop, 1).add(hexA, 1).add(hexB, 1).add(hexC, 1);
const ink = solid(0, 0, 0)
	.add(backdrop.clone().color(0.35, 0.5, 0.85), 1)
	.add(hexA.clone().color(1.0, 0.36, 0.48), 1)
	.add(hexB.clone().color(0.22, 0.9, 1.0), 1)
	.add(hexC.clone().color(1.0, 0.8, 0.24), 1);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.04, 0.06, 0.14));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('MODULATEDARRAY.OFFSET', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PHASE-SHIFTED ARRAYS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Three cloned arrays pulse in relay.', left + 3, top + 6);
	t.print('Each offset shifts phase by 1/3.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('offset(0.0) | (0.33) | (0.66)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
