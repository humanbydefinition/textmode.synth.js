/**
 * @title SynthSource.charMap
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(char(noise(8)).charMap('@#%*+=-:. ').charColor(osc(6, 0.1, 1.2)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
