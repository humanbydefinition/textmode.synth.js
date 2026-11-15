/**
 * @title SynthSource.color2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const rVals = [1.0, 1.0, 0.25, 0.28];
const gVals = [0.32, 0.85, 0.95, 0.65];
const bVals = [0.28, 0.22, 0.58, 1.0];

// Mirror ArrayUtils .fast(0.5).ease('sin') so the live readout stays exact.
function sampleSin(arr, secs) {
	const pos = secs * 0.5 - 0.5;
	const i = Math.floor(pos);
	const u = (1 + Math.sin(Math.PI * (pos - i) - Math.PI / 2)) / 2;
	const a = arr[((i % arr.length) + arr.length) % arr.length];
	const b = arr[(((i + 1) % arr.length) + arr.length) % arr.length];
	return a + (b - a) * u;
}

const r = rVals.fast(0.5).ease('sin');
const g = gVals.fast(0.5).ease('sin');
const b = bVals.fast(0.5).ease('sin');

const out = moire(10, 11, 0.2, 1.4, 0.3).color(r, g, b, 1.0);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.06));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const rv = sampleSin(rVals, t.secs).toFixed(2);
	const gv = sampleSin(gVals, t.secs).toFixed(2);
	const bv = sampleSin(bVals, t.secs).toFixed(2);
	const status = `RGB: ${rv}, ${gv}, ${bv} | Alpha: 1.0`;
	const width = Math.max(36, [...status].length) + 2;

	t.push();
	t.translate(left + (width + 4) / 2, top + (7 + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, 7 + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.COLOR2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RGBA CHANNEL MULTIPLY', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Multiplies pattern by R, G, B, A.', left + 3, top + 6);
	t.print('Tints monochrome moire waves live.', left + 3, top + 7);
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
