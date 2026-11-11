/**
 * @title setFunction.combine
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
		['SETFUNCTION.COMBINE', [120, 240, 180]],
		['------------------------------------', [70, 100, 140]],
		['CONCEPT: CUT-PAPER COMPOSITE', [140, 210, 255]],
		['A combine receives _c0 and _c1.', [140, 160, 190]],
		['The second source cuts windows.', [140, 160, 190]],
		['------------------------------------', [70, 100, 140]],
		['lattice.signalCut(windows)', [140, 255, 200]],
	]);
});

setFunction({
	name: 'signalCut',
	type: 'combine',
	inputs: [{ name: 'edge', type: 'float', default: 0.08 }],
	glsl: `
		float key = _luminance(_c1.rgb);
		float mask = smoothstep(0.5 - edge, 0.5 + edge, key);
		float seam = 1.0 - smoothstep(0.0, edge, abs(key - 0.5));
		vec3 cut = mix(_c0.rgb, _c1.rgb, mask);
		cut = mix(cut, vec3(1.0, 0.72, 0.18), seam * 0.85);
		return vec4(cut, max(_c0.a, _c1.a));
	`,
});

const lattice = moire(10, 13, 0.06, 1.57, 0.018).color(0.12, 0.72, 1.0);
const windows = shape(6, 0.38, 0.035).repeat(3, 2).rotate(0.3, 0.04).color(0.95, 0.16, 0.34);

t.synth(lattice.signalCut(windows, 0.08).charMap(' .:+oxOX#@').cellColor(0.025, 0.035, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
