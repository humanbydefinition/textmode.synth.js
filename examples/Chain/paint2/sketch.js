/**
 * @title SynthSource.paint
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8).paint(0.9, 0.8, 0.7));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
