/**
 * @title SynthSource.twirl
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(5, 0.35).twirl(1.5, 0.4));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
