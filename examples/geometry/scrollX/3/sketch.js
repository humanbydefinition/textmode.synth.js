import { textmode } from 'textmode.js';
import { SynthPlugin, noise, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	gradient(0.125)
		.scrollX(0, (ctx) => Math.sin(ctx.time * 0.05) * 0.05)
		.scrollY(0, (ctx) => Math.cos(ctx.time * 0.01) * -0.07)
		.pixelate([5, 2, 10], [15, 8])
		.scale(0.15)
		.modulate(noise(1, 0.25))
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
