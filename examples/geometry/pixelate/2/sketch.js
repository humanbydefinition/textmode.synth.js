import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, src, prev, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 4,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	noise()
		.mult(osc(10, 0.25, 1))
		.scrollY(1, 0.25)
		.pixelate([100, 40, 20, 70].fast(0.25))
		.modulateRotate(src().scale(0.5), 0.125)
		.diff(src().rotate([-0.05, 0.05].fast(0.125)))
);

t.draw(() => {
	
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
