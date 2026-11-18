/**
 * @title SynthSource.mirror
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const modes = [
	{ x: 1, y: 1, label: '4-WAY XY' },
	{ x: 1, y: 0, label: 'X MIRROR' },
	{ x: 0, y: 1, label: 'Y MIRROR' },
	{ x: 0, y: 0, label: 'UNMIRRORED' },
];
const currentMode = () => modes[Math.floor(t.secs * 1.0) % modes.length];

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor((cols - 1) / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const mode = currentMode();
	t.cellColor(6, 10, 22);
	t.push();
	t.translate(left + (width + 3) / 2, top + (lines + 5) / 2);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.MIRROR', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: AXIS MIRROR FOLDING', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('mirrorX folds left and right halves.', left + 3, top + 6);
	t.print('mirrorY folds top and bottom halves.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`X: ${mode.x}  Y: ${mode.y}  (${mode.label})`, left + 3, top + 9);
});

const wave = osc(7, 0.1, 1.1).rotate(0.55).contrast(1.35);
const folded = shape(3, 0.3, 0.04)
	.rotate(0, 0.5)
	.scroll(0.24, 0.22)
	.blend(wave, 0.45)
	.brightness(0.08)
	.contrast(1.25)
	.mirror(
		() => currentMode().x,
		() => currentMode().y
	);
const glyphs = folded.clone();

t.synth(folded.char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.03, 0.08));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
