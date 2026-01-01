import { textmode } from 'textmode.js';
import { SynthPlugin, shape, char } from 'textmode.synth.js';

const t = textmode.create({
	width: window.innerWidth,
	height: window.innerHeight,
	fontSize: 16,
	plugins: [SynthPlugin]
});

const synthChain = shape(100, 0.01, 1)
	.invert(() => Math.sin(t.millis() / 1000) * 2);

t.layers.base.synth(
	char(synthChain, 2)
		.charMap('. ')

		.charColor(synthChain)

		.cellColor(synthChain.clone().invert())
);

t.draw(() => {

});

t.windowResized(() => {
	t.resizeCanvas(window.innerWidth, window.innerHeight);
});
