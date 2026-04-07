/**
 * @title SynthSource.moire
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(moire(14, 15, 0.2, 1.2, 0.2, 0.1).color(0.7, 0.5, 1.1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
