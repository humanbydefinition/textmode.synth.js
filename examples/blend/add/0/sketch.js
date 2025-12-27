import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = shape().add(shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1]);

t.layers.base.synth(
	charShape()
		.charColor(colorChain)
		.cellColor(colorChain)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
