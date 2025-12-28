import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

const colorChain = osc(10, 1, 1).rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05);

t.layers.base.synth(
	charOsc(50, 1, 1, 16)
		.rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05)

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
