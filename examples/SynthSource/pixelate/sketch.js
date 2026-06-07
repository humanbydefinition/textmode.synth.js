/**
 * @title SynthSource.pixelate
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

	drawText(`SYNTHSOURCE.PIXELATE`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: RESOLUTION PIXELATION`, x, y++, 100, 220, 255);
	drawText(`Snaps coordinates into grid steps.`, x, y++, 140, 160, 190);
	drawText(`Creates retro pixelated styling.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Grid: Eased (8x8 to 64x64)`, x, y++, 140, 255, 180);
});

t.layers.base.synth(plasma(8, 0.5).pixelate([8, 64].ease('easeInOutQuad')).color(0.5, 0.8, 0.2));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
