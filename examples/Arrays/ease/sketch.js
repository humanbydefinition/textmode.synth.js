/**
 * @title ModulatedArray.ease
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(4).rotate([-1.5, 1.5].ease('sin')));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
