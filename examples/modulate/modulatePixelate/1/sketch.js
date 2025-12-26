import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charNoise(3, 0.5, 16)
		.modulatePixelate(noise(3).pixelate(8, 8), 1024, 8)


		.charColor(
			noise(3).modulatePixelate(noise(3).pixelate(8, 8), 1024, 8)
		)

		.cellColor(
			noise(3).modulatePixelate(noise(3).pixelate(8, 8), 1024, 8).invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c