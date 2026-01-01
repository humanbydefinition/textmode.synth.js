import { textmode } from 'textmode.js';
import { SynthPlugin,  gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = gradient(1).scrollY(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05);

t.layers.base.synth(
	gradient(1)
		.rotate(1.57)
		.scrollY(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05)

		.charColor(colorChain)

		.cellColor(colorChain.clone().invert())
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

