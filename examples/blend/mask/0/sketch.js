import { textmode } from 'textmode.js';
import { SynthPlugin, voronoi, gradient } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	gradient(5)
		.mask(voronoi(), 3, 0.5).invert([0, 1])
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
