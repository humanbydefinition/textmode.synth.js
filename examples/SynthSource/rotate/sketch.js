/**
 * @title SynthSource.rotate
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(8, 0.1, 1.2).rotate(0.4, 0.1).kaleid(5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
