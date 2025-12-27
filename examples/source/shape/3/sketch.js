import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(16, 0, 8, 0.5)
		.charMap('@#%*+=-:. ')
		.repeat(12, 12)
		.rotate((ctx) => ctx.time % (Math.PI * 2))
		.scrollX(1, -0.25)

		.charColor(
			osc(10, 1, 2).mult(shape(16, 0.5, 0))
				.rotate((ctx) => ctx.time % (Math.PI * 2))
				.scrollX(1, -0.25)
		)

		.cellColor(
			osc(10, 0.5, 1).mult(shape(16, 0.5, 0))
				.rotate((ctx) => ctx.time % (Math.PI * 2))
				.scrollX(1, -0.25)
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
