import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charGradient(1, 16)
		.scrollX(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05)

		.charColor(
			gradient(1)
			.scrollX(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05)
		)

		.cellColor(
			gradient(1)
			.scrollX(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05)
			.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
