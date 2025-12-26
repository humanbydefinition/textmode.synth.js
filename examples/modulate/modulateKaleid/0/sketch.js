import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(9, -0.1, 0.1, 16)
		.modulateKaleid(osc(11, 0.5, 0), 50)
		.scale(0.1, 0.3)
		.modulate(noise(5, 0.1))
		.mult(solid(1, 1, 0.3))


		.charColor(
			osc(9, -0.1, 0.1)
				.modulateKaleid(osc(11, 0.5, 0), 50)
				.scale(0.1, 0.3)
				.modulate(noise(5, 0.1))
				.mult(solid(1, 1, 0.3))
		)

		.cellColor(
			osc(9, -0.1, 0.1)
				.modulateKaleid(osc(11, 0.5, 0), 50)
				.scale(0.1, 0.3)
				.modulate(noise(5, 0.1))
				.mult(solid(1, 1, 0.3))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
