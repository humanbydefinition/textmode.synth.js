import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc([10, 30, 60].fast(2), 0.1, 1.5, 16)



		.charColor(
			osc([10, 30, 60].fast(2), 0.1, 1.5)

		)

		.cellColor(
			osc([10, 30, 60].fast(2), 0.1, 1.5)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
