/**
 * @title SynthSource.modulateRotate
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(4, 0.35).modulateRotate(noise(2, 0.1), 0.5, 0));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
