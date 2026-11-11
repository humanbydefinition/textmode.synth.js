/**
 * @title setFunction.coord
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

function drawLabel(lines) {
	const { cols, rows } = labelLayer.grid;
	const [left, top] = [-Math.floor(cols / 2), -Math.floor(rows / 2)];
	const width = Math.max(...lines.map(([text]) => [...text].length)) + 2;
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines.length + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines.length + 2);
	t.pop();
	t.printAlign('left', 'top');
	lines.forEach(([text, color], i) => {
		t.charColor(color[0], color[1], color[2]);
		t.print(text, left + 3, top + 3 + i);
	});
}

labelLayer.draw(() => {
	t.clear();
	drawLabel([
		['SETFUNCTION.COORD', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FOLDED COORDINATES', [140, 210, 255]],
		['A coord rewrites _st first.', [140, 160, 190]],
		['Straight lines become pleats.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['moire(...).pleat(9, 0.24)', [140, 255, 200]],
	]);
});

setFunction({
	name: 'pleat',
	type: 'coord',
	inputs: [
		{ name: 'folds', type: 'float', default: 9 },
		{ name: 'depth', type: 'float', default: 0.24 },
	],
	glsl: `
		float column = floor(_st.x * folds);
		float local = fract(_st.x * folds) - 0.5;
		float direction = mod(column, 2.0) * 2.0 - 1.0;
		vec2 st = _st;
		st.y += direction * (0.5 - abs(local)) * depth;
		st.x += sin((_st.y + time * 0.025) * 18.0) * 0.012;
		return st;
	`,
});

const folds = moire(9, 12, 0.03, 1.57, 0.018).pleat(9, 0.24);
const ink = gradient(0.035).pleat(9, 0.24).color(1.0, 0.42, 0.14);

t.synth(folds.charMap(' ._/-|\\#@').charColor(ink).cellColor(0.045, 0.025, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
