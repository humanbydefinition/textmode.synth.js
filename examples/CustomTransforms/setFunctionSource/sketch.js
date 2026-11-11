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
		['SETFUNCTION.SOURCE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: PROCEDURAL FIELD', [140, 210, 255]],
		['A src creates pixels from _st.', [140, 160, 190]],
		['Here: an animated tide chart.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['setFunction(...).sources.tideChart', [140, 255, 200]],
	]);
});

const tideChart = setFunction({
	name: 'tideChart',
	type: 'src',
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
}).sources.tideChart;

const glyphs = tideChart(4.5, 0.3).charMap(' .,:;=xX#@');
const ink = tideChart(3.0, -0.12).color(0.22, 0.82, 1.15);
const paper = tideChart(1.6, 0.04).color(0.025, 0.055, 0.11);

t.synth(glyphs.charColor(ink).cellColor(paper));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
