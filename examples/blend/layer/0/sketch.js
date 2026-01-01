import { textmode } from 'textmode.js';
import { SynthPlugin, solid, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = solid(1, 0, 0, 1).layer(shape(4).color(0, 1, 0, (ctx) => Math.sin(ctx.time * 2)));

t.layers.base.synth(
	solid(0)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())

		.charMap("@")
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

