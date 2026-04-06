const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const base = [6, 12, 18].fast(1.5);

t.layers.base.synth(osc(base, 0.1, 1.2).layer(osc(base.offset(0.5), 0.1, 1.2), 0.5));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
