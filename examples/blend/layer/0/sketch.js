import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = solid(1, 0, 0, 1).layer(shape(4).color(0, 1, 0, (ctx) => Math.sin(ctx.time * 2)));

t.layers.base.synth(
	charSolid(34)
		.charColor(colorChain)
		.cellColor(colorChain)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
