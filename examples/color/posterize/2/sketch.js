import { textmode } from 'textmode.js';
import { SynthPlugin, osc, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

// not yet working as expected
t.layers.base.synth(
	osc(1).posterize(3, 1)
		.layer(osc(1).pixelate(16, 1)
			.mask(shape(2, 0.5, 0.001).scrollY(-0.25)))
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

