import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(3, 0, 2, 16)
		.modulate(noise().add(gradient(), -1), 1)


		.charColor(
			osc(3, 0, 2)
				.modulate(noise().add(gradient(), -1), 1)
		)

		.cellColor(
			osc(3, 0, 2)
				.modulate(noise().add(gradient(), -1), 1)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c