import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(8, 0.1, 0, 16)
		//.posterize([1, 5, 15, 30], 0.5)

		.charColor(
			osc().posterize(3, 1)
				.layer(osc().pixelate(16, 1)
					.mask(shape(2, 0.5, 0.001).scrollY(-0.25)))
		)

		.cellColor(
			osc().posterize(3, 1)
				.layer(osc().pixelate(16, 1)
					.mask(shape(2, 0.5, 0.001).scrollY(-0.25)))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
