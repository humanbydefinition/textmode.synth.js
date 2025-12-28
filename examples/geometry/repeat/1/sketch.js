import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(1.25, 4, 8, 0.5)
		.repeat(3, 3)
		.scale(2)
		.repeat(5, 5, (ctx) => Math.sin(ctx.time), (ctx) => Math.sin(ctx.time / 2))

		.charColor(
			shape(1.25, 0.5, 0.25)
				.repeat(3, 3)
				.scale(2)
				.repeat(5, 5, (ctx) => Math.sin(ctx.time), (ctx) => Math.sin(ctx.time / 2))
		)

		.cellColor(
			shape(1.25, 0.5, 0.25)
				.repeat(3, 3)
				.scale(2)
				.repeat(5, 5, (ctx) => Math.sin(ctx.time), (ctx) => Math.sin(ctx.time / 2))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
