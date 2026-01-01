import { textmode } from 'textmode.js';
import { SynthPlugin,  osc, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(1, 1, 2)
	.diff(shape(6, 1.1, 0.01)
		.scale((ctx) => Math.sin(ctx.time) * 0.05 + 0.9)
		.kaleid(15)
		.rotate((ctx) => ctx.time % 360));

t.layers.base.synth(
	osc(1, -0.3, 2)
		.scale((ctx) => Math.sin(ctx.time) * 0.05 + 0.9)
		.kaleid(15)
		.rotate((ctx) => ctx.time % 360)

		.charColor(colorChain)

		.cellColor(colorChain.clone().hue())
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

