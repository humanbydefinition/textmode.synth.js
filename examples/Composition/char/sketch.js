/**
 * @title char
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(
	char(osc(6, 0.1, 1.2)).charMap('@#%*+=-:. ').charColor(osc(12, 0.05, 0.2))
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
