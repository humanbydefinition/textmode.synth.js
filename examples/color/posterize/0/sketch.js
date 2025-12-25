import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charGradient(0, 16)
	.rotate(1.57)
		//.posterize([1, 5, 15, 30], 0.5)

		.charColor(
			gradient(0)
				.posterize([1, 5, 15, 30], 0.5)
		)

		.cellColor(
			gradient(0)
				.posterize([1, 5, 15, 30], 0.5)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
