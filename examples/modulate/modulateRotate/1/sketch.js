import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = osc().modulateRotate(shape(999,0.3,0.5),1.57);

t.layers.base.synth(
	charOsc(8, 0.1, 0, 16)
		.modulateRotate(shape(999,0.3,0.5),1.57)


		.charColor(colorChain)

		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c