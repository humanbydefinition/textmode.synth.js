import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(3)
		.scale(1.5, 1)
		.kaleid(5)
		.kaleid(12)
		.scale((ctx) => Math.sin(ctx.time / 5) * 0.5)
		.rotate(1, 1)

		.charColor(
			shape()
				.scale(1.5, 1)
				.invert((ctx) => 1 - Math.sin(ctx.time))
				.kaleid(5)
				.kaleid(12)
				.scale((ctx) => Math.sin(ctx.time / 5) * 0.5)
				.rotate(1, 1)
		)

		.cellColor(
			shape()
				.scale(1.5, 1)
				.invert((ctx) => Math.sin(ctx.time))
				.kaleid(5)
				.kaleid(12)
				.scale((ctx) => Math.sin(ctx.time / 5) * 0.5)
				.rotate(1, 1)
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
