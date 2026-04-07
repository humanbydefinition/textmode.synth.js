/**
 * @title paint.paint2
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(paint(0.9, 0.8, 0.7).char(osc(6, 0.1, 0.5)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
