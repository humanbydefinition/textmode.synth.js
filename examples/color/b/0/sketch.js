import { textmode } from 'textmode.js';
import { SynthPlugin, osc, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(60, 0.1, 1.5).layer(gradient().colorama(1).b());

t.layers.base.synth(
	osc(1)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

