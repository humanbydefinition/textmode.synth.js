/**
 * @title SynthSource.fisheye
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

	drawText(`SYNTHSOURCE.FISHEYE`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: FISHEYE BULGE WARP`, x, y++, 100, 220, 255);
	drawText(`Applies radial fisheye warp.`, x, y++, 140, 160, 190);
	drawText(`Simulates curved bubble lens.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Fisheye: Eased (0.5 to 2.0)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(plasma(5, 0.2).fisheye([0.5, 2.0].ease('easeInOutCubic')).color(0.9, 0.3, 0.7));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
