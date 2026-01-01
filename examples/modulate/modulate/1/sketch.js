import { textmode } from 'textmode.js';
import { SynthPlugin,  osc, noise, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc(3, 0, 2)
		.modulate(noise().add(gradient(), -1), 1)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c
