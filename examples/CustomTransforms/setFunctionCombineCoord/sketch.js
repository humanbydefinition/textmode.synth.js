/**
 * @title setFunction.combineCoord
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
		['SETFUNCTION.COMBINECOORD', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: FIELD DISPLACEMENT', [140, 210, 255]],
		['A second source bends sampling.', [140, 160, 190]],
		['Fine lines expose the flow field.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['moire(...).fieldBend(osc(...))', [140, 255, 200]],
	]);
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
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
