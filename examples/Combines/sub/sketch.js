const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(100, 0.5).sub(shape(100, 0.3), 1));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
