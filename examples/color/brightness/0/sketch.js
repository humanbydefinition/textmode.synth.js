import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(20, 0, 2, 16)

		.charColor(
			osc(20, 0, 2)
			.brightness((ctx) => Math.sin(ctx.time))
		)

		.cellColor(
			osc(20, 0, 2)
				.brightness((ctx) => Math.sin(ctx.time))
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
