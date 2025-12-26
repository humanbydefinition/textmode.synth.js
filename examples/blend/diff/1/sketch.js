import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charOsc(1, 1, 2, 16)

		.charColor(
			osc(1, 1, 2)
				.diff(shape(6, 1.1, 0.01)
					.scale((ctx) => Math.sin(ctx.time) * 0.05 + 0.9)
					.kaleid(15)
					.rotate((ctx) => ctx.time % 360))
		)

		.cellColor(
			osc(1, 1, 2)
				.diff(shape(6, 1.1, 0.01)
					.scale((ctx) => Math.sin(ctx.time) * 0.05 + 0.9)
					.kaleid(15)
					.rotate((ctx) => ctx.time % 360))
			//.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
