/**
 * @title SynthSource.gradient
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const speed = 1.2;

labelLayer.draw(() => {
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const rowCount = 7;
	const width = 38;
	const blue = Math.sin(t.secs * speed).toFixed(2);
	t.clear();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (rowCount + 5) / 2);
	t.rect(width, rowCount + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.GRADIENT', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: UV-TO-RGB GRADIENT', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Maps X to red and Y to green.', left + 3, top + 6);
	t.print('speed pulses blue with sin(time).', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`SPEED ${speed} | BLUE SIN: ${blue}`, left + 3, top + 9);
});

// Pure UV-to-RGB gradient rotated slowly so red/green axes sweep while blue pulses.
const ramp = gradient(speed).rotate(0, 0.25);
const glyphs = ramp.clone();

t.synth(ramp.char(glyphs).cellColor(0.02, 0.03, 0.08).charMap(' .:-=+*#%@'));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
