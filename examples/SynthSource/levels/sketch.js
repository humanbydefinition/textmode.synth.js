/**
 * @title SynthSource.levels
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
let inMin = 0.05;
let inMax = 0.95;

// Soft mid-range plasma + cyan wave lets levels() crunch shadows and peaks.
const baseField = plasma(5, 0.25, 0, 0.7)
	.color(0.25, 0.9, 0.95)
	.add(osc(6, 0.1, 0.8).rotate(0.8).color(0.15, 0.45, 1.0), 0.38);

const out = baseField.levels(
	(ctx) => {
		const sweep = 0.5 + 0.5 * Math.sin(ctx.time * 1.1);
		inMin = 0.04 + sweep * 0.3;
		inMax = 0.96 - sweep * 0.3;
		return inMin;
	},
	(ctx) => 0.96 - (0.5 + 0.5 * Math.sin(ctx.time * 1.1)) * 0.3,
	0.0,
	1.0,
	1.0
);

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.01, 0.04, 0.07));

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
	t.print('SYNTHSOURCE.LEVELS', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: INPUT/OUTPUT LEVELS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Remaps [inMin, inMax] to output.', left + 3, top + 6);
	t.print('Narrowing input boosts contrast.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`IN: ${inMin.toFixed(2)}..${inMax.toFixed(2)} | OUT: 0.00..1.00`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
