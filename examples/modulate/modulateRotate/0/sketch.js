import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = voronoi(100, 3, 5)
    .modulateRotate(osc(1, 0.5, 0).kaleid(50).scale(0.5), 15, 0)
    .mult(osc(50, -0.1, 8).kaleid(9));

t.layers.base.synth(
	charVoronoi(100, 3, 16)
		.modulateRotate(osc(1, 0.5, 0).kaleid(50).scale(0.5), 15, 0)
		//.mult(osc(50, -0.1, 8).kaleid(9))

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {
	
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
