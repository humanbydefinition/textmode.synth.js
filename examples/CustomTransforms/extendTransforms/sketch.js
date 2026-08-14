/**
 * @title extendTransforms
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

	drawText('EXTEND TRANSFORMS', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COHESIVE EXTENSION PACK', x, y++, 100, 220, 255);
	drawText('src + coord + color install once.', x, y++, 140, 160, 190);
	drawText('The pack composes like built-ins.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('surveyGrid().scanJitter()', x, y++, 140, 255, 180);
});

const pack = extendTransforms([
	{
		name: 'surveyGrid',
		type: 'src',
		inputs: [
			{ name: 'rings', type: 'float', default: 9 },
			{ name: 'spokes', type: 'float', default: 7 },
		],
		glsl: `vec2 p = (_st - 0.5) * vec2(1.25, 1.0); float radius = length(p); float angle = atan(p.y, p.x); float ring = 1.0 - smoothstep(0.035, 0.1, abs(fract(radius * rings) - 0.5)); float spoke = 1.0 - smoothstep(0.02, 0.1, abs(sin(angle * spokes))); float sweep = pow(max(0.0, cos(angle - time * 0.22)), 18.0); return vec4(vec3(max(ring * 0.8, max(spoke * 0.38, sweep))), 1.0);`,
	},
	{
		name: 'scanJitter',
		type: 'coord',
		inputs: [
			{ name: 'rows', type: 'float', default: 24 },
			{ name: 'amount', type: 'float', default: 0.018 },
		],
		glsl: 'vec2 st = _st; float row = floor(st.y * rows); st.x += sin(row * 2.17 + time * 0.8) * amount; return st;',
	},
	{
		name: 'phosphorInk',
		type: 'color',
		inputs: [
			{ name: 'dark', type: 'vec3', default: [0.01, 0.05, 0.035] },
			{ name: 'glow', type: 'vec3', default: [0.2, 1.0, 0.5] },
			{ name: 'hot', type: 'vec3', default: [1.0, 0.68, 0.2] },
		],
		glsl: 'float v = clamp(_luminance(_c0.rgb), 0.0, 1.0); vec3 ink = mix(dark, glow, smoothstep(0.08, 0.72, v)); ink = mix(ink, hot, smoothstep(0.72, 0.98, v)); return vec4(ink, _c0.a);',
	},
]);

const display = pack.sources.surveyGrid(9, 7).scanJitter(24, 0.018).phosphorInk();

t.synth(display.charMap('  .:+*#%@').cellColor(0.008, 0.025, 0.02));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
