/**
 * @title Textmodifier.seed
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const SEEDS = [101, 204, 309];
let activeSeed = SEEDS[0];
t.seed(activeSeed);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const terrain = voronoi(5.5, 0.25, 0.5).modulate(noise(3.8, 0.2), 0.14).contrast(1.3);
const glyphs = terrain.clone();
const ink = voronoi(4.5, 0.2, 0.4).color(0.28, 0.94, 0.72).hue(0.08).brightness(0.18);

t.synth(terrain.char(glyphs).charMap(' .:-=+*#%@').charColor(ink).cellColor(0.03, 0.08, 0.09));

// Step deterministically across 3 reproducible seeds every 1.2s.
t.draw(() => {
	activeSeed = SEEDS[Math.floor(t.secs / 1.2) % SEEDS.length];
	t.seed(activeSeed);
});

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
	t.print('TEXTMODIFIER.SEED', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: DETERMINISTIC RANDOMNESS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Seed locks noise() and voronoi().', left + 3, top + 6);
	t.print('Cycles 3 reproducible terrains.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SEED: ${activeSeed} (DETERMINISTIC)`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
