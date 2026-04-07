/**
 * @title cellColor
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(cellColor(0.05, 0.08, 0.1, 0.8).char(noise(10)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
