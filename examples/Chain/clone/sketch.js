const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	plugins: [SynthPlugin],
});

const base = osc(6, 0.1, 1.2).kaleid(4);

t.layers.base.synth(noise(8).charColor(base).cellColor(base.clone().invert()));

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
