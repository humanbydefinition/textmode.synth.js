import { textmode } from 'textmode.js';
import { SynthPlugin, shape, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const synthChain = shape(1.25, 0.5, 0.25)
	.repeat(3, 3)
	.scale(2)
	.repeat(5, 5, (ctx) => Math.sin(ctx.time), (ctx) => Math.sin(ctx.time / 2));

t.layers.base.synth(
	char(synthChain)

		.charColor(synthChain)

		.cellColor(synthChain.clone().invert())
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

