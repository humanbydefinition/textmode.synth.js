/**
 * @title SynthSource.modulateScale
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(4, 0.35).modulateScale(osc(6, 0.1, 1.2), 1.5, 0.2));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
