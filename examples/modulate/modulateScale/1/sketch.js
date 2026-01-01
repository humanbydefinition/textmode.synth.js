import { textmode } from 'textmode.js';
import { SynthPlugin, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	shape(4)
		.modulateScale(gradient().g(), 2, 0.5)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
