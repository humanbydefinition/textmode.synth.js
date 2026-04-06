const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

t.layers.base.synth(charColor(1, 0.2, 0.1, 1).char(noise(10)));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
