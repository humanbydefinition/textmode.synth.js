/**
 * @title SynthSource.kaleid
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

	drawText(`SYNTHSOURCE.KALEID`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: RADIAL KALEIDOSCOPE`, x, y++, 100, 220, 255);
	drawText(`Mirrors coordinates radially.`, x, y++, 140, 160, 190);
	drawText(`Creates intricate symmetric shapes.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Segments: Eased (3 to 8)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(osc(10, 0.1, 0.8).kaleid([3, 8].ease('easeInOutQuad')).color(0.9, 0.1, 0.4));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
