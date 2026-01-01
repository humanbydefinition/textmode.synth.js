import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc().color(1, 0, 3);

t.layers.base.synth(
	osc(1)
		.charColor(colorChain.clone().luma(0.5, 1))
		.cellColor(colorChain)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

