/**
 * @title paint
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(paint(0.3).char(noise(7)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
