/**
 * @title EasingFunction.easingFunction
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

	drawText(`EASINGFUNCTION.EASINGFUNCTION`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: CURVED EASING TRANSITION`, x, y++, 100, 220, 255);
	drawText(`Eases array parameter changes.`, x, y++, 140, 160, 190);
	drawText(`Uses easeInOutCubic curve shape.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Curve: easeInOutCubic`, x, y++, 140, 255, 180);
});

t.layers.base.synth(shape(4).rotate([-1.5, 1.5].ease('easeInOutCubic')));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
