/**
 * @title SynthSource.osc
 * @author codex
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

	drawText(`SYNTHSOURCE.OSC`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: SINE WAVE OSCILLATOR`, x, y++, 100, 220, 255);
	drawText(`Generates periodic band patterns.`, x, y++, 140, 160, 190);
	drawText(`Params: frequency, sync, offset.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Freq: 12 | Sync: 0.15`, x, y++, 140, 255, 180);
});

t.layers.base.synth(
	osc(12, 0.15, [0.5, 2.0].ease('easeInOutQuad')).kaleid([3, 7].ease('easeInOutCubic')).color(0.9, 0.25, 1.2)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
