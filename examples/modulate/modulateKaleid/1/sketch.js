import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = osc(10, 0.1, 2).modulateKaleid(osc(16).kaleid(999), 1);

t.layers.base.synth(
	charOsc(10, 0.1, 2, 16)
		.modulateKaleid(osc(16).kaleid(999), 1)

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
