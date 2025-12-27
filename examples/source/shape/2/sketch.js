import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const synthChain = shape(100, 0.5)
	.invert((ctx) => Math.sin(ctx.time) * 2);

t.layers.base.synth(
	charShape(100, 0, 1, 0.5)
		.charMap('. ')

		.charColor(synthChain)

		.cellColor(synthChain.clone().invert())
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
