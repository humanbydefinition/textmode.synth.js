/**
 * @title ModulatedArray.smooth
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(5, 0.4).scale([0.6, 1.2].smooth(0.8)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
