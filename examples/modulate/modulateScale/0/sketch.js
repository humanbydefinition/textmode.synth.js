import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charGradient(5, 16)
		.repeat(50, 50).kaleid([3, 5, 7, 9].fast(0.5))
		.modulateScale(osc(4, -0.5, 0).kaleid(50).scale(0.5), 15, 0)


		.charColor(
			gradient(5)
				.repeat(50, 50).kaleid([3, 5, 7, 9].fast(0.5))
				.modulateScale(osc(4, -0.5, 0).kaleid(50).scale(0.5), 15, 0)
		)

		.cellColor(
			gradient(5)
				.repeat(50, 50).kaleid([3, 5, 7, 9].fast(0.5))
				.modulateScale(osc(4, -0.5, 0).kaleid(50).scale(0.5), 15, 0)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
