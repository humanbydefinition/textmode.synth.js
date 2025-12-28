import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(25, -0.1, 0.5).kaleid(50);

t.layers.base.synth(
	charOsc(25, -0.1, 0.5, 32)
		.kaleid(50)

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
