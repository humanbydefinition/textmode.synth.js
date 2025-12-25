import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charSolid(16)
		//.posterize([1, 5, 15, 30], 0.5)

		.charColor(
			solid(1, 1, 1)
				.invert([0, 1])
		)

		.cellColor(
			solid(1, 1, 1)
				.invert([1, 0])
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
