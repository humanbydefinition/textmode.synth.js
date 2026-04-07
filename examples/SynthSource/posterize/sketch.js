/**
 * @title SynthSource.posterize
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(gradient(0.2).posterize(4, 0.7));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
