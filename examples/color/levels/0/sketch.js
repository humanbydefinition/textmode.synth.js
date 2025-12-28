import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(60, 0.1, 1.5).layer(gradient().levels(
	[0, 0.3, 0.5, 0.7, 1], 
	[0, 0.2, 0.8, 0.9, 1],
	[0, 0.1, 0.4, 0.6, 1],
	[0, 0.3, 0.5, 0.7, 1],
	1
));

t.layers.base.synth(
	charOsc(60, 0.1, 1.5, 16)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
