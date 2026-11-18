/**
 * @title SynthSource.seed
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const SEEDS = [1, 7, 23, 42];
let activeSeed = SEEDS[0];

// seed() initializes _seed before voronoi() and noise() run in the shader.
const out = solid(0, 0, 0)
	.seed((ctx) => {
		activeSeed = SEEDS[Math.floor(ctx.time * 0.95) % SEEDS.length];
		return activeSeed;
	})
	.add(voronoi(5.5, 0.25, 0.25).color(0.25, 0.95, 0.72), 1.0)
	.add(noise(4.0, 0.15).color(0.95, 0.45, 0.2), 0.35);

const glyphs = out.clone();
t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.03, 0.04, 0.08));

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
	t.print('SYNTHSOURCE.SEED', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: DETERMINISTIC SEEDING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Fixes random layouts for noise and', left + 3, top + 6);
	t.print('voronoi; each seed gives a new map.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SEED: ${String(activeSeed).padStart(2, ' ')} (DETERMINISTIC LAYOUT)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
