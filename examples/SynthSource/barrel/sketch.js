/**
 * @title SynthSource.barrel
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

	drawText(`SYNTHSOURCE.BARREL`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: BARREL LENS DISTORTION`, x, y++, 100, 220, 255);
	drawText(`Applies convex barrel bulge.`, x, y++, 140, 160, 190);
	drawText(`Squeezes edges outward.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Lens: Eased (0.2 to 1.5)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(osc(8, 0.1).barrel([0.2, 1.5].ease('easeInOutQuad')).color(0.5, 0.9, 0.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
