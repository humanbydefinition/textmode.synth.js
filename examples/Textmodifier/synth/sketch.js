/**
 * @title Textmodifier.synth
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

	drawText(`TEXTMODIFIER.SYNTH`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: BASE LAYER SYNTH SHORTCUT`, x, y++, 100, 220, 255);
	drawText(`Comfort method for t.synth().`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`t.synth(noise(8).color(0.9, 0.5, 0.2))`, x, y++, 140, 255, 180);
});

t.synth(
	noise(8, 0.1, 1.2)
		.kaleid(5)
		.charColor(osc(6, 0.1, 1.2))
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
