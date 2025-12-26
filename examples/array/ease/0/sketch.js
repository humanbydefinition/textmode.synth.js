import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	charShape(4)
		.rotate([-3.14, 3.14].ease('easeInOutCubic'))

		.charColor(
			shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic'))
		)

		.cellColor(
			shape(4).rotate([-3.14, 3.14].ease('easeInOutCubic')).invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
