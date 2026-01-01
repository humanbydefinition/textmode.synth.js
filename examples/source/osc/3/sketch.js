import { textmode } from 'textmode.js';
import { SynthPlugin, osc, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const charChain = osc(1, 0.1, (ctx) => Math.sin(ctx.time / 10) * 10)

const colorChain = osc(10, 0.1, (ctx) => Math.sin(ctx.time / 10) * 100)

t.layers.base.synth(
	char(charChain)
		.charColor(colorChain)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
