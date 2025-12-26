import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(4, 2, 4, 0.9)
	

		.charColor(
			shape(4, 0.9)
				.mult(osc(4, 0.25, 1))
				.modulateRepeatY(osc(10), 5.0, (ctx) => Math.sin(ctx.time) * 5)
				.scale(1, 0.5, 0.05)
		)

		.cellColor(
			shape(4, 0.9)
				.mult(osc(4, 0.25, 1))
				.modulateRepeatY(osc(10), 5.0, (ctx) => Math.sin(ctx.time) * 5)
				.scale(1, 0.5, 0.05)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
