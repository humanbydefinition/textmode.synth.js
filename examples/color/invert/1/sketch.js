import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(4, 0.1, 2, 16)

		.charColor(
			osc(4, 0.1, 2).invert().luma().invert()
				.layer(osc(4, 0.1, 2).luma()
					.mask(shape(2, 0.5).scrollY(-0.25)))
		)

		.cellColor(
			osc(4, 0.1, 2).luma().invert()
				.layer(osc(4, 0.1, 2).invert().luma()
					.mask(shape(2, 0.5).scrollY(-0.25)))
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
