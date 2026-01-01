import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(20, 0, 2).brightness((ctx) => Math.sin(ctx.time));

t.layers.base.synth(
	osc(1)
		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
