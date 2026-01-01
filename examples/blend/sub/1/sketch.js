import { textmode } from 'textmode.js';
import { SynthPlugin,  osc,  noise, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});


t.layers.base.synth(
	osc(6, 0, 1.5)
		.modulate(
			noise(3)
				.sub(
					gradient()
				),
			1
		)
);

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});

