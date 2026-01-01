import { textmode } from 'textmode.js';
import { SynthPlugin, voronoi, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

t.layers.base.synth(
	voronoi(25, 0, 0)
		.modulateScrollY(osc(10), 0.5, 0.25)
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c