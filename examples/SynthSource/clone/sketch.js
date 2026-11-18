/**
 * @title SynthSource.clone
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// One core diamond chain branches into three independent clones.
const core = shape(4, 0.22, 0.04).rotate(0, 0.65);
const centerBlue = core.clone().scale(1.35).color(0.35, 0.65, 1.0);
const leftCoral = core.clone().scroll(-0.18, 0.0).color(1.0, 0.38, 0.48);
const rightMint = core.clone().scroll(0.18, 0.0).rotate(0.7854).color(0.25, 0.95, 0.65);

const out = centerBlue.screen(leftCoral).screen(rightMint);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.04, 0.09));

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
	t.print('SYNTHSOURCE.CLONE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: NON-MUTATING BRANCHES', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Copies a base chain cleanly.', left + 3, top + 6);
	t.print('Each branch keeps its own transform.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('CLONE: 3 BRANCHED DIAMOND VARIANTS', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
