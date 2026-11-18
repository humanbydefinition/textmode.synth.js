/**
 * @title setFunction.batch
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Register a cohesive src + coord + color pack atomically in one call.
const pack = setFunction([
	{
		name: 'facetWave',
		type: 'src',
		inputs: [{ name: 'scale', type: 'float', default: 6.5 }],
		glsl: `
			vec2 p = (_st - 0.5) * scale;
			float a = sin(p.x + p.y + time * 0.6);
			float b = cos(p.x - p.y - time * 0.45);
			float band = smoothstep(-0.35, 0.75, a * b + 0.35 * sin(length(p) * 1.8 - time));
			float edge = 1.0 - smoothstep(0.04, 0.16, abs(a * b));
			return vec4(vec3(max(band * 0.85, edge * 0.95)), 1.0);
		`,
	},
	{
		name: 'ribbonShear',
		type: 'coord',
		inputs: [{ name: 'amount', type: 'float', default: 0.055 }],
		glsl: `
			vec2 st = _st;
			st.x += sin(st.y * 12.0 + time * 0.9) * amount;
			st.y += cos(st.x * 8.0 - time * 0.6) * (amount * 0.5);
			return st;
		`,
	},
	{
		name: 'emberGrade',
		type: 'color',
		inputs: [{ name: 'warmth', type: 'float', default: 1.0 }],
		glsl: `
			float v = clamp(_luminance(_c0.rgb), 0.0, 1.0);
			vec3 col = mix(vec3(0.04, 0.02, 0.08), vec3(0.86, 0.18, 0.24), smoothstep(0.05, 0.55, v));
			col = mix(col, vec3(1.0, 0.84, 0.32) * warmth, smoothstep(0.55, 0.95, v));
			return vec4(col, _c0.a);
		`,
	},
]);

const out = pack.sources.facetWave(6.5).ribbonShear(0.055).emberGrade(1.0);
const glyphs = out.clone();

t.synth(out.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.015, 0.04));

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
	t.print('SETFUNCTION.BATCH', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: ATOMIC EXTENSION PACK', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('src + coord + color register once', left + 3, top + 6);
	t.print('and chain via pack.sources.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('facetWave().ribbonShear()', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
