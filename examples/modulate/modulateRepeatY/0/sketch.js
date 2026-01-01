import { textmode } from 'textmode.js';
import { SynthPlugin, osc, shape, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const charChain = shape(4, 0.9)
	.mult(osc(1, 0.25, 1))
	.modulateRepeatY(osc(1), 1.0, (ctx) => Math.sin(ctx.time))
	.scale(1, 0.5, 0.05);

const colorChain = shape(4, 0.9)
	.mult(osc(4, 0.25, 1))
	.modulateRepeatY(osc(10), 5.0, (ctx) => Math.sin(ctx.time) * 5)
	.scale(1, 0.5, 0.05);

t.layers.base.synth(
	char(charChain)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
