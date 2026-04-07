/**
 * @title SynthSource.plasma
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(plasma(8, 0.6, 0.2, 1.4).kaleid(4));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
