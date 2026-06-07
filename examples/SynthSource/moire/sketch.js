/**
 * @title SynthSource.moire
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

	drawExampleLabel('SynthSource.moire', left + 1, top + 1);
}

labelLayer.draw(drawExampleLabels);

t.layers.base.synth(moire(14, 15, 0.2, 1.2, 0.2, 0.1).color(0.7, 0.5, 1.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
