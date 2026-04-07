/**
 * @title SynthSource.cellColor
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8).cellColor(osc(6, 0.1, 1.2).invert()));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
