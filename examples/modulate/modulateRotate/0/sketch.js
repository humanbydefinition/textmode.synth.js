import { textmode } from 'textmode.js';
import { SynthPlugin, osc, voronoi } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = voronoi(100, 3, 5)
    .modulateRotate(osc(1, 0.5, 0).kaleid(50).scale(0.5), 15, 0)
    .mult(osc(50, -0.1, 8).kaleid(9));

t.layers.base.synth(
	voronoi(100, 3)
		.modulateRotate(osc(1, 0.5, 0).kaleid(50).scale(0.5), 15, 0)
		//.mult(osc(50, -0.1, 8).kaleid(9))

		.charColor(colorChain)
		.cellColor(colorChain.clone().shift())
);

t.draw(() => {
	
});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
