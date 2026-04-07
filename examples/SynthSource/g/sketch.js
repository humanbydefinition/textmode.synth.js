/**
 * @title SynthSource.g
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(gradient(0.2).g(1.2, 0.1).kaleid(5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
