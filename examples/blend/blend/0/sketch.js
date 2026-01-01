import { textmode } from 'textmode.js';
import { SynthPlugin, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	shape(3)
		.scale(0.5)
		.blend(
			shape(4).scale(2), [0, 0.25, 0.5, 0.75, 1]
		)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
