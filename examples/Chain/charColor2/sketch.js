const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(noise(8).charColor(1, 0.2, 0.1, 1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
