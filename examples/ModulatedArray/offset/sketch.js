/**
 * @title ModulatedArray.offset
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const labelLayer = t.layers.add();

function drawExampleLabel(text, col, row, color = '#ffffff') {
	t.color(color);
	t.printAlign('left', 'top');
	t.print(text, col, row);
}

function drawExampleLabels() {
	t.clear();
	const left = -Math.floor(t.grid.cols / 2);
	const top = -Math.floor(t.grid.rows / 2);

	drawExampleLabel('ModulatedArray.offset', left + 1, top + 1);
}

labelLayer.draw(drawExampleLabels);

const base = [6, 12, 18].fast(1.5);

t.layers.base.synth(osc(base, 0.1, 1.2).layer(osc(base.offset(0.5), 0.1, 1.2), 0.5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
