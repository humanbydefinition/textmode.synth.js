import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = osc([10, 30, 60].fast(0.5), 0.1, 1.5);

t.layers.base.synth(
	charOsc([10, 30, 60].fast(0.5), 0.1, 1.5, 16)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

