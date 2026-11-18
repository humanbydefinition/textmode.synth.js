/**
 * @title SynthSource.paint2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const red = () => 0.62 + 0.35 * Math.sin(t.secs * 1.8);
const green = () => 0.62 + 0.35 * Math.sin(t.secs * 1.3 + 2.1);
const blue = () => 0.7 + 0.28 * Math.sin(t.secs * 1.5 + 4.2);

const glyphs = osc(7, 0.32, 0).kaleid(5);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').paint(red, green, blue, 1).cellColor(0.04, 0.06, 0.12));

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;

	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();

	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.PAINT2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: PAINT WITH RGBA ARGS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('paint(r, g, b, a) animates RGB.', left + 3, top + 6);
	t.print('cellColor() darkens bg contrast.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`PAINT RGBA: ${red().toFixed(2)}, ${green().toFixed(2)}, ${blue().toFixed(2)}, 1`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
