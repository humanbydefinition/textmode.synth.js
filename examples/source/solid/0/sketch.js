import { textmode } from 'textmode.js';
import { SynthPlugin, solid, charColor, } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)

t.layers.base.synth(
	colorChain
		.cellColor(colorChain.clone().invert())
		.charMap('a')
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

