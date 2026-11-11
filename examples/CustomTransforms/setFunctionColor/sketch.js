/**
 * @title setFunction.color
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
		['SETFUNCTION.COLOR', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: LIMITED-COLOR PRINT', [140, 210, 255]],
		['A color maps _c0 to new ink.', [140, 160, 190]],
		['Bands reveal its quantization.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['terrain.printBands(6)', [140, 255, 200]],
	]);
});

setFunction({
	name: 'printBands',
	type: 'color',
	inputs: [
		{ name: 'steps', type: 'float', default: 6 },
		{ name: 'shadow', type: 'vec3', default: [0.025, 0.04, 0.09] },
		{ name: 'paper', type: 'vec3', default: [0.82, 0.72, 0.42] },
		{ name: 'accent', type: 'vec3', default: [1.0, 0.16, 0.08] },
	],
	glsl: `
		float value = clamp(_luminance(_c0.rgb), 0.0, 1.0);
		float band = floor(value * steps) / max(steps - 1.0, 1.0);
		float registration = smoothstep(0.68, 0.92, fract(value * steps));
		vec3 ink = mix(shadow, paper, band);
		ink = mix(ink, accent, registration * (1.0 - band * 0.6));
		return vec4(ink, _c0.a);
	`,
});

const terrain = moire(5, 7, 0.08, 1.3, 0.022).add(noise(3, 0.025), 0.3);

t.synth(terrain.printBands(6).charMap('  .:+=xX#@').cellColor(0.02, 0.025, 0.055));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
