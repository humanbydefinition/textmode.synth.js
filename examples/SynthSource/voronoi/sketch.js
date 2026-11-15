/**
 * @title SynthSource.voronoi
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const blends = [0.05, 0.35, 0.75];
const blendModes = ['crystal', 'shaded', 'organic'];

const cells = voronoi(4.5, 0.35, blends.fast(0.4)).levels(0.05, 0.85, 0.05, 1.0);

t.synth(cells.clone().color(0.55, 0.95, 1.0).char(cells).charMap(' .:-=+*#%@').cellColor(0.02, 0.05, 0.1));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const step = Math.floor(t.secs * 0.4) % blends.length;
	const status = `Blend: ${blends[step].toFixed(2)} (${blendModes[step]}) | Scale: 4.5`;
	const width = Math.max(36, [...status].length) + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.VORONOI', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VORONOI CELLULAR FIELD', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Steps blending: crystal to soft.', left + 3, top + 6);
	t.print('Cell value maps both color & glyph.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(status, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
