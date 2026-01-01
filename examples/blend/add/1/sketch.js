import { textmode } from 'textmode.js';
import { SynthPlugin,  osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(9, 0.1, 1).add(osc(13, 0.5, 5));

t.layers.base.synth(
	osc(1)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

