import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	osc(10, -0.25, 1).color(0, 0, 1).saturate(2).kaleid(50)
		.mask(noise(25, 2).modulateScale(noise(0.25, 0.05)))
		.modulateScale(osc(6, -0.5, 2).kaleid(50))
		.mult(osc(3, -0.25, 2).kaleid(50))
		.scale(0.5, 0.5, 0.75)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
