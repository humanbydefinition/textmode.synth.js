import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const synthChain = gradient(0).r().repeat(16, 1).scrollX(0, 0.1);

t.layers.base.synth(
	charGradient(0, 255)
		.scrollX(0, 0.01)

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
