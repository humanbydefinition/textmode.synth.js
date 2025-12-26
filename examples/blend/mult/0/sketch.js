import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(9, 0.1, 2, 16)

		.charColor(
			osc(9, 0.1, 2)
				.mult(
					osc(13,0.5,5)
				)
		)

		.cellColor(
			osc(9, 0.1, 2)
				.mult(
					osc(13,0.5,5)
				)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
