import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charSolid, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = solid([1, 0, 0], [0, 1, 0], [0, 0, 1], 1)

t.layers.base.synth(
	charSolid([16, 17, 18])

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
