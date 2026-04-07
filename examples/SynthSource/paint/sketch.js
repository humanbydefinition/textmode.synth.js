/**
 * @title SynthSource.paint
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8).paint(osc(6, 0.1, 1.2).kaleid(4)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
