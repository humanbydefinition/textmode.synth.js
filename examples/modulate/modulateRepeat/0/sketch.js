import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(4, 2, 4, 0.9)

		.charColor(
			shape(4, 0.9)
				.mult(osc(3, 0.5, 1))
				.modulateRepeat(osc(10), 3.0, 3.0, 0.5, 0.5)
		)

		.cellColor(
			shape(4, 0.9)
				.mult(osc(3, 0.5, 1))
				.modulateRepeat(osc(10), 3.0, 3.0, 0.5, 0.5)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
