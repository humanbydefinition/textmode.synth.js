import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(20, 0.1, 0, 16)

		.charColor(
			osc(20)
				.contrast((ctx) => Math.sin(ctx.time) * 5)
		)

		.cellColor(
			osc(20)
				.contrast((ctx) => Math.sin(ctx.time) * 5)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
