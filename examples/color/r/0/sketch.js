import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(60, 0.1, 1.5, 16)

		.charColor(
			osc(60, 0.1, 1.5)
				.layer(
					gradient().r()
				)
		)

		.cellColor(
			osc(60, 0.1, 1.5)
				.layer(
					gradient().r()
				)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
