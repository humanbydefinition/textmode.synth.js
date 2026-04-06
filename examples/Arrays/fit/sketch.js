const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(6).scale([2, 6].fit(0.5, 1.5)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
