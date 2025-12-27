import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	voronoi()
		.color(0.9, 0.25, 0.15)
		.rotate((ctx) => (ctx.time % 360) / 2)
		.modulate(osc(25, 0.1, 0.5)
			.kaleid(50)
			.scale((ctx) => Math.sin(ctx.time * 1) * 0.5 + 1)
			.modulate(noise(0.6, 0.5)),
			0.5)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
