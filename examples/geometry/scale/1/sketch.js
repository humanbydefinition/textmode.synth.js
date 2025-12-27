import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	shape()
		.scale(1.5, [0.25, 0.5, 0.75, 1].fast(0.25), [3, 2, 1])
		.invert([0, 1].fast(0.25))
		.kaleid(5)
		.kaleid(12)
		.scale((ctx) => Math.sin(ctx.time / 5) * 0.5)
		.rotate(1, 1)
);

t.draw(() => {
	//t.clear();
	//synthLayer.synthRender();

	// t.char("A");
	// t.rect(t.grid.cols / 2, t.grid.rows / 2);
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
