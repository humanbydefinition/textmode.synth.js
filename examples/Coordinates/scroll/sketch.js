/**
 * @title SynthSource.scroll
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(6, 0.1).scroll(0.2, -0.1, 0.05, 0.02));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
