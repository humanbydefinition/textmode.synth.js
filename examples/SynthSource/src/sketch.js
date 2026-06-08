/**
 * @title SynthSource.src
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

	drawText('SYNTHSOURCE.SRC', x, y++, 100, 255, 255);
	drawText('------------------------------------', x, y++, 50, 150, 150);
	drawText('CONCEPT: SELF-FEEDBACK LOOP', x, y++, 100, 255, 255);
	drawText('Samples previous frame as texture source.', x, y++, 150, 240, 240);
	drawText('Infinite recursive trails: feedback + fresh.', x, y++, 150, 240, 240);
	drawText('------------------------------------', x, y++, 50, 150, 150);
	drawText('src(): Bloom with scale 1.015 + rotate 0.025', x, y++, 100, 255, 255);
});

t.layers.base.synth(
	src()
		.scale(1.015)
		.rotate(0.025)
		.blend(osc(22, 0.1).kaleid(5).color(0.2, 0.7, 1.0), 0.06)
		.blend(osc(28, 0.12).kaleid(4).rotate(0.8).color(1.0, 0.2, 0.5), 0.04)
		.contrast(1.15)
		.charColor(0.6, 0.7, 0.95)
		.cellColor(0.02, 0.02, 0.06)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
