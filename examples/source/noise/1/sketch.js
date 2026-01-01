import { textmode } from 'textmode.js';
import { SynthPlugin, noise } from 'textmode.synth.js';

const t = textmode.create({
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 8,
    plugins: [SynthPlugin]
});

t.layers.base.synth(
	noise((ctx) => Math.sin(ctx.time / 10) * 50, (ctx) => Math.sin(ctx.time / 2) / 500)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

