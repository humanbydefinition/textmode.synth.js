import { textmode } from 'textmode.js';
import { SynthPlugin, osc, shape, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const charChain = shape(5, 0.5, 0.1)
	.repeat(12, 12)
	.rotate((ctx) => ctx.time % (Math.PI * 2))
	.scrollX(1, -0.25);

const colorChain = osc(10, 1, 2).mult(shape(16, 0.5, 0))
	.rotate((ctx) => ctx.time % (Math.PI * 2))
	.scrollX(1, -0.25);

t.layers.base.synth(
	char(charChain)
		.charMap('@#%*+=-:. ')

		.charColor(colorChain)

		.cellColor(colorChain.clone().hue())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
