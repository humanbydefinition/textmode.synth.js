/**
 * @title setFunction.combineCoord
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

	drawText('SET FUNCTION: COMBINECOORD', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: FIELD DISPLACEMENT', x, y++, 100, 220, 255);
	drawText('A second source bends sampling.', x, y++, 140, 160, 190);
	drawText('Fine lines expose the flow field.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('moire(...).fieldBend(osc(...))', x, y++, 140, 255, 180);
});

setFunction({
	name: 'fieldBend',
	type: 'combineCoord',
	inputs: [{ name: 'amount', type: 'float', default: 0.12 }],
	glsl: `
		vec2 flow = (_c0.rg - vec2(0.5)) * 2.0;
		vec2 ripple = vec2(
			sin((_st.y + time * 0.03) * 18.0),
			cos((_st.x - time * 0.02) * 14.0)
		);
		return _st + flow * amount + ripple * amount * 0.12;
	`,
});

const current = osc(2.2, 0.025, 0.9).rotate(-0.4, 0.03);
const wire = moire(14, 17, 0.025, 1.57, 0.012).fieldBend(current, 0.12);
const ink = osc(3, 0.02, 1.2).color(0.2, 0.95, 0.72);

t.synth(wire.charMap(' ~-/\\|+x#@').charColor(ink).cellColor(0.015, 0.04, 0.055));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
