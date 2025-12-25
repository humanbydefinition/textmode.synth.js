import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 8,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	charNoise((ctx) => Math.sin(ctx.time / 10) * 50, (ctx) => Math.sin(ctx.time / 2) / 500, 16)
	.charColor(
		noise((ctx) => Math.sin(ctx.time / 10) * 50, (ctx) => Math.sin(ctx.time / 2) / 500)
	)
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
