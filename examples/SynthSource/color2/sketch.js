/**
 * @title SynthSource.color2
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(10, 0.1, 1.2).color(0.2, 0.6, 1.0));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
