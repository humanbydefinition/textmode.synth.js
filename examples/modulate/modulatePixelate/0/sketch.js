import { textmode } from 'textmode.js';
import { SynthPlugin, noise, voronoi } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	voronoi(10, 1, 5)
		.brightness(() => Math.random() * 0.15)
		.modulatePixelate(noise(25, 0.5), 100)
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

