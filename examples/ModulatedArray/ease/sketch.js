/**
 * @title ModulatedArray.ease
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(17);

const labelLayer = t.layers.add();
const glyphs = ' .:-=+*#%@';
const fold = [-0.85, -0.2, 0.45, 1.05].fast(0.2).ease('easeInOutCubic');
const span = [0.58, 1.18, 0.74, 1.32].fast(0.2).ease('easeInOutCubic');

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

	drawText('MODULATEDARRAY.EASE', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('EASED FOLD TRANSITIONS', x, y++, 120, 220, 255);
	drawText('Easing changes travel, not values.', x, y++, 160, 180, 210);
	drawText('The accordion accelerates mid-step.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText("array.ease('easeInOutCubic')", x, y++, 150, 255, 190);
});

const glyphField = shape(4, 0.38, 0.025).scale(span).rotate(fold).repeat(4, 3);
const lines = osc(12, 0.018, 1.3).rotate(fold, 0.006).kaleid(4);
const inkField = shape(4, 0.38, 0.025)
	.scale(span)
	.rotate(fold)
	.repeat(4, 3)
	.color(1.0, 0.72, 0.2)
	.screen(osc(12, 0.018, 1.3).rotate(fold, 0.006).kaleid(4).color(0.38, 0.3, 1.0), 0.42);
const paperField = plasma(span.fit(2.5, 4.2), 0.014, 0.35, 1.0).brightness(0.2).color(0.18, 0.09, 0.3);

t.synth(char(glyphField.add(lines, 0.38)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
