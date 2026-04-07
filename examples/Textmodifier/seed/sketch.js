/**
 * @title Textmodifier.seed
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.seed(42);

t.layers.base.synth(noise(10, 0.1).charMap('@#%*+=-:. '));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
