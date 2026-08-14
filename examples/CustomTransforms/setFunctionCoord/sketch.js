/**
 * @title setFunction.coord
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add();

function drawText(text, x, y, r = 220, g = 230, b = 255) {
	t.push();
	t.printAlign('left', 'top');
	t.charColor(r, g, b);
	t.print(text, x, y);
	t.pop();
}

labelLayer.draw(() => {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);
	let y = top + 3;
	const x = left + 3;

	drawText('SET FUNCTION: COORD', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: FOLDED COORDINATES', x, y++, 100, 220, 255);
	drawText('A coord rewrites _st first.', x, y++, 140, 160, 190);
	drawText('Straight lines become pleats.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('moire(...).pleat(9, 0.24)', x, y++, 140, 255, 180);
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
});
