import { textmode } from 'textmode.js';
import { SynthPlugin, osc, char } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 16,
    plugins: [SynthPlugin]
});

const charChain = osc(1).rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05);	
const colorChain = osc(10, 1, 1).rotate((ctx) => ctx.time % 360, (ctx) => Math.sin(ctx.time * 0.1) * 0.05);

t.layers.base.synth(
	char(charChain)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

