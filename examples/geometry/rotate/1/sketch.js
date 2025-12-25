import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(50, 0, 16)
		.rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05)

		.charColor(
			osc(10, 1, 1)
			.rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05)
		)

		.cellColor(
			osc(10, 1, 1)
			.invert()
			.rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05)
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
