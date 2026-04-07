/**
 * @title SynthSource.scrollY
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(8, 0.1, 1.2).rotate(0.5).scrollY(-0.3, 0.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
