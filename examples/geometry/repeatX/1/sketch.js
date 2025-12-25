import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(5, 0, 1, 32)
		.rotate(1.57)
		.repeatX([1,2,5,10], (ctx) => Math.sin(ctx.time))


		.charColor(
			osc(5, 0, 1)
				.rotate(1.57)
				.repeatX([1,2,5,10], (ctx) => Math.sin(ctx.time))
		)

		.cellColor(
			osc(5, 0, 1)
				.rotate(1.57)
				.repeatX([1,2,5,10], (ctx) => Math.sin(ctx.time))
				.invert()
		)
);

t.draw(() => {
	//t.clear();
	//synthLayer.synthRender();

	// t.char("A");
	// t.rect(t.grid.cols / 2, t.grid.rows / 2);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
