import { textmode } from 'textmode.js';
import { SynthPlugin, osc, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const charChain = osc(1, 0.1, 2).modulateKaleid(osc(8).kaleid(999), 1);
const colorChain = osc(10, 0.1, 2).modulateKaleid(osc(16).kaleid(999), 1);

t.layers.base.synth(
	char(charChain)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
