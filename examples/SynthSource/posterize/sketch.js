/**
 * @title SynthSource.posterize
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

	drawText('SYNTHSOURCE.POSTERIZE', x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('CONCEPT: COLOR POSTERIZATION', x, y++, 100, 220, 255);
	drawText('Quantizes colors into distinct bins.', x, y++, 140, 160, 190);
	drawText('Creates banded poster/retro styles.', x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText('Posterize: 4 discrete color steps', x, y++, 140, 255, 180);
});

t.layers.base.synth(gradient(0.5).hue(0.2).posterize(4.0, 0.6).charMap(' .:-=+*#%@').cellColor(0.05, 0.05, 0.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
