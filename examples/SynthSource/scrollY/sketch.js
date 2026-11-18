/**
 * @title SynthSource.scrollY
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

// Horizontal ribbons (4 full sine cycles for seamless wrap) plus wide rungs.
const ribbons = osc(Math.PI * 8, 0, 0.7)
	.rotate(1.5708)
	.thresh(0.45, 0.05)
	.color(1.0, 0.35, 0.55);
const rungs = shape(4, 0.36, 0.02).scale(1.0, 2.2, 0.45).repeat(4, 4).color(1.0, 0.8, 0.3);
const pattern = ribbons.add(rungs).scrollY(0, 0.25);

t.synth(pattern.char(pattern.clone()).charMap(' ._-=+#@').cellColor(0.09, 0.02, 0.05));

labelLayer.draw(() => {
	const left = -Math.floor((labelLayer.grid.cols - 1) / 2);
	const top = -Math.floor(labelLayer.grid.rows / 2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + 2 + 37 / 2, top + 2 + 8 / 2);
	t.char(' ');
	t.rect(38, 9);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.SCROLLY', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: VERTICAL SCROLLING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Shifts only Y coordinates over time.', left + 3, top + 6);
	t.print('X stays fixed as rungs climb.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print('SCROLLY: OFFSET 0.0 | SPEED 0.25/S', left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
