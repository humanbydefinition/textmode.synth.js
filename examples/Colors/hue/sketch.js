/**
 * @title SynthSource.hue
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(6, 0.1, 1.2).hue(0.3));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
