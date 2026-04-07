/**
 * @title TextmodeLayer.clearSynth
 * @author codex
 */

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8, 0.1).charMap('@#%*+=-:. '));

// Remove the synth after 2 seconds.
setTimeout(() => {
	t.layers.base.clearSynth();
}, 2000);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
