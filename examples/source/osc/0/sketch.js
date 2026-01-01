import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc([1, 10, 50, 100, 250, 500].fast(2))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

