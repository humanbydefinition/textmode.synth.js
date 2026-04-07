/**
 * @title SynthSource.contrast
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(8, 0.1, 1.2).contrast(1.6));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
