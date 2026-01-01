import { textmode } from 'textmode.js';
import { SynthPlugin, osc, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(4, 0.1, 2).invert().luma().invert()
	.layer(osc(4, 0.1, 2).luma()
		.mask(shape(2, 0.5).scrollY(-0.25)));

t.layers.base.synth(
	osc(4, 0.1, 2)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

