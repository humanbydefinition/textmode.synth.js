const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(shape(6, 0.35, 0.02).rotate(() => t.secs));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
