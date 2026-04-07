/**
 * @title charColor
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(charColor(0.9).char(noise(6)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
