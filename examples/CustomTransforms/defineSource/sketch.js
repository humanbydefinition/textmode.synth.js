/**
 * @title defineSource
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

	drawText('DEFINE SOURCE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: PROCEDURAL FIELD', x, y++, 100, 220, 255);
	drawText('A src creates pixels from _st.', x, y++, 140, 160, 190);
	drawText('Here: an animated tide chart.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('tideChart(4.5, 0.3)', x, y++, 140, 255, 180);
});

const tideChart = defineSource({
	name: 'tideChart',
	inputs: [
		{ name: 'frequency', type: 'float', default: 4.5 },
		{ name: 'drift', type: 'float', default: 0.3 },
	],
	glsl: `
		vec2 p = _st - vec2(0.58, 0.46);
		float swell = sin((p.x * frequency + p.y * 1.7) * 6.2831853 + time * drift);
		float echo = cos(length(p * vec2(1.0, 1.7)) * frequency * 11.0 - time * drift);
		float coast = smoothstep(0.68, 0.12, length(p * vec2(0.8, 1.25)));
		float level = floor(clamp(swell * 0.28 + echo * 0.22 + 0.5, 0.0, 1.0) * 8.0) / 7.0;
		return vec4(vec3(level * coast), 1.0);
	`,
});

const glyphs = tideChart(4.5, 0.3).charMap(' .,:;=xX#@');
const ink = tideChart(3.0, -0.12).color(0.22, 0.82, 1.15);
const paper = tideChart(1.6, 0.04).color(0.025, 0.055, 0.11);

t.synth(glyphs.charColor(ink).cellColor(paper));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
