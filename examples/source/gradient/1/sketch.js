import { textmode } from 'textmode.js';
import { SynthPlugin, char, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const charChain = gradient(0).r().repeat(4, 1).scrollX(0, 0.01);
const colorChain = gradient(0).r().repeat(4, 1).scrollX(0, 0.1);

t.layers.base.synth(
	char(charChain)

	.charColor(colorChain)

	.cellColor(colorChain.clone().hue(0.5))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

