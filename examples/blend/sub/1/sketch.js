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
	charOsc(6, 0, 1.5, 16)

		.charColor(
			osc(6, 0, 1.5)
				.modulate(
					noise(3)
					.sub(
						gradient()
					),
					1
				)
		)

		.cellColor(
			osc(6, 0, 1.5)
				.modulate(
					noise(3)
					.sub(
						gradient()
					),
					1
				)
				//.invert()
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
