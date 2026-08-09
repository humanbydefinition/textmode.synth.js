/**
 * @title setFunction.color
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

	drawText('SET FUNCTION: COLOR', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: LIMITED-COLOR PRINT', x, y++, 100, 220, 255);
	drawText('A color maps _c0 to new ink.', x, y++, 140, 160, 190);
	drawText('Bands reveal its quantization.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('terrain.printBands(6)', x, y++, 140, 255, 180);
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
});
