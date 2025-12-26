import { textmode } from 'textmode.js';
import { SynthPlugin, charNoise, charOsc, osc, charSolid, noise, solid, voronoi, charVoronoi, charShape, charGradient, shape, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

// does not produce expected result yet
// certain framebuffers in textmode.js need to be FLOAT for this..
t.layers.base.synth(
	charOsc(8, 0.1, 0, 16)

		.charColor(
			osc()
				.sub(
					osc(6)
				)
		)

		.cellColor(
			osc()
				.sub(
					osc(6)
				)
				.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
