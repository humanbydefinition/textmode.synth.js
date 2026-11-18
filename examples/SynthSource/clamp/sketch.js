/**
 * @title SynthSource.clamp
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const WINDOWS = [
	{ name: 'CEIL', min: 0.0, max: 0.42 },
	{ name: 'FLOOR', min: 0.35, max: 0.9 },
	{ name: 'FULL', min: 0.0, max: 1.0 },
];
let active = WINDOWS[0];

// Overdriven wave lattice crosses 0..1.7 so clamp() plateaus are obvious.
const lattice = osc(8, 0.2, 1.2)
	.add(osc(8, 0.2, 1.2).rotate(1.5708), 0.7)
	.color(1.0, 0.45, 0.85);

const out = lattice.clamp(
	(ctx) => {
		active = WINDOWS[Math.floor(ctx.time * 0.95) % WINDOWS.length];
		return active.min;
	},
	(ctx) => WINDOWS[Math.floor(ctx.time * 0.95) % WINDOWS.length].max
);

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.05, 0.02, 0.06));

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
	t.print('SYNTHSOURCE.CLAMP', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CHANNEL CLAMPING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Locks RGB channels inside [min,max].', left + 3, top + 6);
	t.print('Clips bright peaks or lifts shadows.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CLAMP ${active.name}: ${active.min.toFixed(2)}..${active.max.toFixed(2)}`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
