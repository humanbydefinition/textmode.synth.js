/**
 * @title cellColor.cellColor
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

	drawText(`CELLCOLOR.CELLCOLOR`, x, y++, 100, 255, 140);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`CONCEPT: CELL COLORING`, x, y++, 100, 220, 255);
	drawText(`Renders dynamic cells backdrop.`, x, y++, 140, 160, 190);
	drawText(`Combines rainbow plasma with noise.`, x, y++, 140, 160, 190);
	drawText('------------------------------------', x, y++, 80, 100, 150);
	drawText(`Cell: plasma | Char: noise thresh`, x, y++, 140, 255, 180);
});

t.layers.base.synth(cellColor(plasma(6, 0.3).colorama(0.15)).char(noise(8, 0.2).thresh(0.5)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
