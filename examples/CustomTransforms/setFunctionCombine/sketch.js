/**
 * @title setFunction.combine
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

	drawText('SET FUNCTION: COMBINE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: CUT-PAPER COMPOSITE', x, y++, 100, 220, 255);
	drawText('A combine receives _c0 and _c1.', x, y++, 140, 160, 190);
	drawText('The second source cuts windows.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('lattice.signalCut(windows)', x, y++, 140, 255, 180);
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
});
