/**
 * @title SynthSource.noise
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

t.bpm(60);

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const scales = [4, 8, 16];

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const scale = scales[Math.floor(t.secs * 0.25) % scales.length];
	t.clear();
	t.push();
	t.translate(left + (width + 4) / 2, top + (rowCount + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.NOISE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: 3D GRADIENT NOISE', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Samples smooth organic contours.', left + 3, top + 6);
	t.print('scale zooms; offset animates Z.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SCALE ${scale} | OFFSET 0.20`, left + 3, top + 9);
});

// Modulated array steps spatial scale at 60 BPM while offset=0.2 drifts smoothly through Z.
const field = noise(scales.fast(0.25), 0.2).brightness(0.35);
const glyphs = field.clone();

t.synth(field.color(0.22, 0.88, 0.96).char(glyphs).cellColor(0.02, 0.05, 0.09).charMap(' .,:;~=+*#%@'));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
