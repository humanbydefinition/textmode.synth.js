/**
 * @title ModulatedArray.fit
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin],
});

t.bpm(17);

const labelLayer = t.layers.add();
const glyphs = '  .:-=+*#@';
const rawSurvey = [14, 37, 82, 145].fast(0.2).smooth(0.8);
const heading = rawSurvey.fit(-0.75, 0.75);
const magnify = rawSurvey.fit(0.68, 1.28);
const detail = rawSurvey.fit(5, 18);

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

	drawText('MODULATEDARRAY.FIT', x, y++, 110, 255, 170);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('ONE SURVEY, THREE RANGES', x, y++, 120, 220, 255);
	drawText('fit remaps values without retiming.', x, y++, 160, 180, 210);
	drawText('Angle, scale, and detail stay linked.', x, y++, 160, 180, 210);
	drawText('------------------------------------', x, y++, 70, 110, 140);
	drawText('rawSurvey.fit(low, high)', x, y++, 150, 255, 190);
});

const glyphField = moire(detail, detail, 0.04, 1.57, 0.012).rotate(heading).scale(magnify);
const marker = shape(5, 0.34, 0.03).rotate(heading).scale(magnify);
const inkField = moire(detail, detail, 0.04, 1.57, 0.012)
	.rotate(heading)
	.scale(magnify)
	.color(0.72, 0.32, 1.0)
	.screen(shape(5, 0.34, 0.03).rotate(heading).scale(magnify).color(0.2, 0.95, 0.72), 0.5);
const paperField = plasma(rawSurvey.fit(2.4, 4.5), 0.014, 0.4, 1.0).brightness(0.2).color(0.1, 0.05, 0.28);

t.synth(char(glyphField.add(marker, 0.32)).charMap(glyphs).charColor(inkField).cellColor(paperField));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
