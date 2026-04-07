/**
 * @title SynthSource.charColor3
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8).charColor(0.9));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
