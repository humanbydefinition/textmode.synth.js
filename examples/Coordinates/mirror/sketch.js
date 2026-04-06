const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(osc(8, 0.1, 1.2).mirror(1, 0));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
