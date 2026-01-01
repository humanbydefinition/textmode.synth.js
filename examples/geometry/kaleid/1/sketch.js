import { textmode } from 'textmode.js';
import { SynthPlugin,  osc, char } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

const charChain = osc(1, -0.1, 0.5).kaleid(4).kaleid(4);
const colorChain = osc(25, -0.1, 0.5).kaleid(4).kaleid(4);

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
