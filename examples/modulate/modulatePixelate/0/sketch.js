import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charVoronoi(10, 1, 16)
		.brightness(() => Math.random() * 0.15)
		.modulatePixelate(noise(25, 0.5), 100)


		.charColor(
			voronoi(10, 1, 5)
				.brightness(() => Math.random() * 0.15)
				.modulatePixelate(noise(25, 0.5), 100)
		)

		.cellColor(
			voronoi(10, 1, 5)
				.brightness(() => Math.random() * 0.15)
				.modulatePixelate(noise(25, 0.5), 100)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
