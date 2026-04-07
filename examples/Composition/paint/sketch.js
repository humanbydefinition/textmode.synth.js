/**
 * @title paint
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(paint(osc(10, 0.1, 1.2).kaleid(4)).char(noise(6)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
