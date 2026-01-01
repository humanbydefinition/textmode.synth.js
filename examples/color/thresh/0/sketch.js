import { textmode } from 'textmode.js';
import { SynthPlugin,noise } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	noise(3, 0.1).thresh(0.5, 0.04)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

