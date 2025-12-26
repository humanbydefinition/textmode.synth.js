import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charVoronoi(25, 0, 16)
		.modulateScrollX(osc(10), 0.5, 0.25)


		.charColor(
			voronoi(25, 0, 0)
				.modulateScrollX(osc(10), 0.5, 0.25)
		)

		.cellColor(
			voronoi(25, 0, 0)
				.modulateScrollX(osc(10), 0.5, 0.25)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c