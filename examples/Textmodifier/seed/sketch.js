/**
 * @title Textmodifier.seed
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.seed(2026);

const labelLayer = t.layers.add();
const glyphs = ' .,:;=xX#@';

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

	drawText('TEXTMODIFIER.SEED', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('REPEATABLE THREE-FIELD TERRAIN', x, y++, 120, 220, 255);
	drawText('The seed locks every random source.', x, y++, 160, 180, 210);
	drawText('Refresh: the terrain stays itself.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('t.seed(2026)', x, y++, 150, 255, 190);
});

const glyphField = noise(5.4, 0.025)
	.modulate(voronoi(5.5, 0.022, 0.58), 0.16)
	.contrast(1.2);
const inkField = voronoi(6.2, 0.018, 0.48)
	.color(0.32, 0.95, 0.7)
	.screen(noise(4.0, 0.02).color(1.0, 0.46, 0.12), 0.32);
const paperField = noise(3.2, 0.016)
	.brightness(0.2)
	.color(0.05, 0.18, 0.13)
	.softlight(voronoi(4.0, 0.014, 0.65), 0.28);

t.synth(char(glyphField).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
