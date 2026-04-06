const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(4, 0.35).invert(1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
