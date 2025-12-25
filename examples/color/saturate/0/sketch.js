import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(10, 0, 1, 16)

		.charColor(
			osc(10, 0, 1)
				.saturate((ctx) => (Math.sin(ctx.time) * 10))
		)

		.cellColor(
			osc(10, 0, 1)
				.saturate((ctx) => (Math.sin(ctx.time) * 10))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
