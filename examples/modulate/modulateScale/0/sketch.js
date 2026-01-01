import { textmode } from 'textmode.js';
import { SynthPlugin, osc, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	gradient(5)
		.repeat(50, 50).kaleid([3, 5, 7, 9].fast(0.5))
		.modulateScale(osc(4, -0.5, 0).kaleid(50).scale(0.5), 15, 0)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
