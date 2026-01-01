import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc(10, [-10, -1, -0.1, 0, 0.1, 1, 10], 0)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

