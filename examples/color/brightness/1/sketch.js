import { textmode } from 'textmode.js';
import { SynthPlugin, noise } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	noise().brightness(1).color(0.5, 0.5, 0.5)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

