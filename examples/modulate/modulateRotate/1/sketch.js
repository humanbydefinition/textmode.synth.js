import { textmode } from 'textmode.js';
import { SynthPlugin, osc, shape } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 8,
	plugins: [SynthPlugin]
});

const colorChain = osc().modulateRotate(shape(999,0.3,0.5),1.57);

t.layers.base.synth(
	osc(1)
		.modulateRotate(shape(999,0.3,0.5),1.57)


		.charColor(colorChain)

		.cellColor(colorChain.clone().invert())
);
t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
c
