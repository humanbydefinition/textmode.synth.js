import { textmode } from 'textmode.js';
import { SynthPlugin, src, osc, noise, char, } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const charChain = noise(0.1, 0)
	.mult(osc(0.1, 0.25, 1))
	.scrollY(1, 0.25)
	.pixelate([100, 40, 20, 70].fast(0.25))
	.modulateRotate(src().scale(0.5), 0.125)
	.diff(src().rotate([-0.05, 0.05].fast(0.125)));

const colorChain = noise()
	.mult(osc(10, 0.25, 1))
	.scrollY(1, 0.25)
	.pixelate([100, 40, 20, 70].fast(0.25))
	.modulateRotate(src().scale(0.5), 0.125)
	.diff(src().rotate([-0.05, 0.05].fast(0.125)));

t.layers.base.synth(
	char(charChain) 
		.cellColor(colorChain)
		.charColor(colorChain.clone().hue(0.5))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

