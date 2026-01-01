import { textmode } from 'textmode.js';
import { SynthPlugin, osc } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const colorChain = osc(20)
	.color([1, 0, 0, 1, 0], [0, 1, 0, 1, 0], [0, 0, 1, 1, 0])
	.colorama([0.005, 0.33, 0.66, 1.0].fast(0.125));

t.layers.base.synth(
	osc(1)

		.charColor(colorChain)
		.cellColor(colorChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
