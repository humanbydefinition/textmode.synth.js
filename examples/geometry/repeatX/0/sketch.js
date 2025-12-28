import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	shape(3)
		.repeatX(3, 0)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
