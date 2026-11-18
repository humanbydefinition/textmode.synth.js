/**
 * @title SynthSource.scale
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const MODES = [
	{ name: 'ZOOM OUT', amount: 0.58, xMult: 1.0, yMult: 1.0 },
	{ name: 'ZOOM IN', amount: 1.55, xMult: 1.0, yMult: 1.0 },
	{ name: 'WIDE', amount: 1.0, xMult: 1.65, yMult: 0.62 },
	{ name: 'TALL', amount: 1.0, xMult: 0.62, yMult: 1.65 },
];

// Smoothly ease between uniform zoom and aspect-ratio stretch modes.
function currentScale(ctx) {
	const phase = (ctx.time * 0.55) % MODES.length;
	const index = Math.floor(phase);
	const next = (index + 1) % MODES.length;
	const f = phase - index;
	const blend = f * f * (3 - 2 * f);
	const a = MODES[index];
	const b = MODES[next];
	return {
		label: MODES[Math.round(phase) % MODES.length].name,
		amount: a.amount + (b.amount - a.amount) * blend,
		xMult: a.xMult + (b.xMult - a.xMult) * blend,
		yMult: a.yMult + (b.yMult - a.yMult) * blend,
	};
}

let live = { label: 'ZOOM OUT', amount: 0.58, xMult: 1.0, yMult: 1.0 };

// Concentric hexagonal ring and core make zoom and axis stretch clear.
const outerRing = shape(6, 0.44, 0.015)
	.diff(shape(6, 0.31, 0.015))
	.color(0.2, 0.9, 0.85);
const innerHex = shape(6, 0.18, 0.015).color(1.0, 0.35, 0.65);
const hexTarget = outerRing.add(innerHex).scale(
	(ctx) => {
		live = currentScale(ctx);
		return live.amount;
	},
	(ctx) => currentScale(ctx).xMult,
	(ctx) => currentScale(ctx).yMult
);

t.synth(hexTarget.char(hexTarget.clone()).charMap(' .:-=+*#%@').cellColor(0.05, 0.03, 0.1));

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
	t.print('SYNTHSOURCE.SCALE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: SPATIAL ZOOM & STRETCH', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Scales UV coordinates from center.', left + 3, top + 6);
	t.print('xMult and yMult stretch each axis.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(
		`${live.label} ${live.amount.toFixed(2)} (${live.xMult.toFixed(2)}, ${live.yMult.toFixed(2)})`,
		left + 3,
		top + 9
	);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
