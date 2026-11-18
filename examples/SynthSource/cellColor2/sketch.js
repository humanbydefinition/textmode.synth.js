/**
 * @title SynthSource.cellColor2
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });

const red = () => 0.16 + 0.15 * Math.sin(t.secs * 1.4);
const green = () => 0.14 + 0.13 * Math.sin(t.secs * 1.9 + 2.1);
const blue = () => 0.24 + 0.2 * Math.sin(t.secs * 1.1 + 4.2);

const glyphs = osc(8, 0.35).kaleid(6);

t.synth(glyphs.clone().char(glyphs).charMap(' .:-=+*#%@').charColor(0.98, 0.96, 0.88).cellColor(red, green, blue, 1));

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
	t.print('SYNTHSOURCE.CELLCOLOR2', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: RGBA CELL BACKGROUND', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Sets cell bg with (r, g, b, a).', left + 3, top + 6);
	t.print('Four args animate paper hue.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`CELL RGBA: ${red().toFixed(2)}, ${green().toFixed(2)}, ${blue().toFixed(2)}, 1`, left + 3, top + 9);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
