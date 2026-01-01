import { textmode } from 'textmode.js';
import { SynthPlugin,  osc, shape, src } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	src()
		.modulateHue(src().scale(1.01), 1)
		.layer(osc(4, 0.5, 2).mask(shape(4, 0.5, 0.001)))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

