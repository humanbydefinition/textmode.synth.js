import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(10, 0, 1, 16)
		.rotate(1.57)
		.scrollY(0.5, 0)

		.charColor(
			osc(10, 0, 1)
				.rotate(1.57)
				.scrollY(0.5, 0)
		)

		.cellColor(
			osc(10, 0, 1)
				.rotate(1.57)
				.scrollY(0.5, 0)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
