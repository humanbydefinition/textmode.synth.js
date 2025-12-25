import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charNoise(3, 0.1, 16)

		.charColor(
			noise(3, 0.1)
				.thresh((ctx) => Math.sin(ctx.time / 2), [0.04, 0.25, 0.75, 1].fast(0.25))
		)

		.cellColor(
			noise(3, 0.1)
				.thresh((ctx) => Math.sin(ctx.time / 2), [0.04, 0.25, 0.75, 1].fast(0.25))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
