/**
 * @title SynthSource.voronoi
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

	drawText(`SYNTHSOURCE.VORONOI`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: VORONOI CELLULAR FIELD`, x, y++, 100, 220, 255);
	drawText(`Dynamic cell distance mapping.`, x, y++, 140, 160, 190);
	drawText(`Organic noise-modulated crystal cells.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Cells: 5-15 Eased | Modulate: noise`, x, y++, 140, 255, 180);
});

t.layers.base.synth(voronoi([5, 15].ease('easeInOutCubic'), 0.15, 0.5).modulate(noise(4), 0.2).colorama(0.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
