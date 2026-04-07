/**
 * @title ModulatedArray
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc([4, 8, 12].fast(1.5), 0.1, 1.2).kaleid(5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
