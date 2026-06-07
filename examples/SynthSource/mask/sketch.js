/**
 * @title SynthSource.mask
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

	drawText(`SYNTHSOURCE.MASK`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: LUMINANCE MASKING`, x, y++, 100, 220, 255);
	drawText(`Masks canvas with secondary luma.`, x, y++, 140, 160, 190);
	drawText(`Hides parts outside mask limits.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Blend: Mask`, x, y++, 140, 255, 180);
});

t.layers.base.synth(osc(12, 0.1).mask(shape(5, 0.4, 0.05).rotate(t.frameCount * 0.02)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
