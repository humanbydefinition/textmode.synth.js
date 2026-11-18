/**
 * @title setFunction.source
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// A 'src' extension generates RGBA pixels directly from _st and time.
setFunction({
	name: 'tideChart',
	type: 'src',
	inputs: [
		{ name: 'frequency', type: 'float', default: 4.5 },
		{ name: 'drift', type: 'float', default: 0.35 },
	],
	glsl: `
		vec2 p = _st - 0.5;
		float wave = sin(p.x * frequency * 6.283 + cos(p.y * 5.0 - time * drift));
		wave += 0.65 * cos(length(p) * frequency * 8.0 - time * drift * 1.6);
		float contour = 1.0 - smoothstep(0.08, 0.24, abs(fract(wave * 1.4) - 0.5));
		float basin = smoothstep(-1.4, 1.4, wave);
		vec3 col = mix(vec3(0.03, 0.14, 0.28), vec3(0.12, 0.68, 0.85), basin);
		col = mix(col, vec3(1.0, 0.78, 0.28), contour * 0.88);
		return vec4(col, 1.0);
	`,
});

const tide = tideChart(4.5, 0.35);
const glyphs = tide.clone();

t.synth(tide.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.015, 0.04, 0.08));

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const height = 9;
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + (width - 1) / 2, top + 2 + (height - 1) / 2);
	t.rect(width, height);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SETFUNCTION.SOURCE', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: CUSTOM SOURCE GENERATOR', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('type: "src" takes _st and time,', left + 3, top + 6);
	t.print('returning RGBA contour colors.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('tideChart(4.5, 0.35)', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
