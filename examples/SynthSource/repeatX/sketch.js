/**
 * @title SynthSource.repeatX
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: window.innerWidth < 700 ? 8 : 16,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add({ fontSize: window.innerWidth < 700 ? 8 : 16 });
const reps = [3, 5, 2];
const currentReps = () => reps[Math.floor(t.secs * 0.9) % reps.length];

labelLayer.draw(() => {
	t.clear();
	const { cols, rows } = labelLayer.grid;
	const left = -Math.floor(cols / 2);
	const top = -Math.floor(rows / 2);
	const width = 38;
	const lines = 7;
	const n = currentReps();
	t.push();
	t.translate(left + (width + 4) / 2, top + (lines + 5) / 2);
	t.cellColor(6, 10, 22);
	t.rect(width, lines + 2);
	t.pop();
	t.printAlign('left', 'top');
	t.charColor(120, 240, 180);
	t.print('SYNTHSOURCE.REPEATX', left + 3, top + 3);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 4);
	t.charColor(140, 210, 255);
	t.print('CONCEPT: HORIZONTAL COLUMNS', left + 3, top + 5);
	t.charColor(140, 160, 190);
	t.print('Splits X space into N columns.', left + 3, top + 6);
	t.print('offset shifts odd columns on Y.', left + 3, top + 7);
	t.charColor(70, 100, 140);
	t.print('------------------------------------', left + 3, top + 8);
	t.charColor(140, 255, 200);
	t.print(`COLUMNS: ${n} | OFFSET Y: 0.25`, left + 3, top + 9);
});

const colsPattern = shape(6, 0.66, 0.08)
	.mult(osc(10, 0.15, 0.3).rotate(Math.PI / 2), 0.75)
	.scale(1, 0.72, 1.3)
	.scrollY(0, 0.2)
	.repeatX(currentReps, 0.25);

const glyphs = colsPattern.clone();

t.synth(colsPattern.color(0.2, 1.0, 0.88).char(glyphs).charMap(' .:-=+*#%@').cellColor(0.02, 0.05, 0.07));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
	const size = window.innerWidth < 700 ? 8 : 16;
	t.fontSize(size);
	for (const layer of t.layers.all) layer.fontSize(size);
});
