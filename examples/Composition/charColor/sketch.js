/**
 * @title charColor
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(charColor(osc(10, 0.1, 1.2)).char(noise(8)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
