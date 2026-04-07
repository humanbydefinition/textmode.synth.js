/**
 * @title SynthSource.solid2
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(solid(0.1, 0.2, 0.5, 1).char(noise(8)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
