/**
 * @title SynthSource.modulatePixelate
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(4, 0.1).modulatePixelate(osc(8, 0.1, 1.2), 20, 5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
